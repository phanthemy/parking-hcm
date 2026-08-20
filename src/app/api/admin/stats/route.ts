import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/pg';

export async function GET(req: NextRequest) {
  try {
    // 1. Data Quality & KPI Queries
    const qualityQuery = `
      SELECT
        COUNT(*) as total_spots,
        COUNT(*) FILTER (WHERE UPPER(status) = 'ACTIVE') as active_spots,
        COUNT(*) FILTER (WHERE UPPER(status) = 'PENDING') as pending_spots,
        COUNT(*) FILTER (WHERE UPPER(status) IN ('HIDDEN', 'DUPLICATE')) as hidden_spots,
        COUNT(*) FILTER (WHERE phone IS NULL OR TRIM(phone) = '') as missing_phone,
        COUNT(*) FILTER (WHERE address ILIKE 'Tọa độ%' OR address ILIKE 'Khu vực tọa độ%' OR address ~ '^[0-9\.\,\s-]+$') as raw_coordinate_address,
        COUNT(*) FILTER (WHERE (open_time IS NULL OR TRIM(open_time) = '') AND (close_time IS NULL OR TRIM(close_time) = '')) as missing_hours,
        COUNT(*) FILTER (WHERE metadata->'images' IS NULL OR jsonb_array_length(metadata->'images') = 0) as missing_images,
        COUNT(*) FILTER (WHERE verified = true) as verified_spots,
        COUNT(*) FILTER (WHERE verified = false OR verified IS NULL) as unverified_spots,
        COUNT(*) FILTER (WHERE confidence_score < 0.85) as low_confidence,
        COUNT(DISTINCT category) as total_categories
      FROM places;
    `;

    // 2. Category Breakdown
    const catQuery = `
      SELECT category, COUNT(*) as count
      FROM places
      GROUP BY category
      ORDER BY count DESC;
    `;

    // 3. User Reports Summary
    const reportsQuery = `
      SELECT 
        COUNT(*) as total_reports,
        COUNT(*) FILTER (WHERE UPPER(status) = 'PENDING') as pending_reports,
        COUNT(*) FILTER (WHERE UPPER(status) = 'INVESTIGATING') as investigating_reports,
        COUNT(*) FILTER (WHERE UPPER(status) = 'RESOLVED') as resolved_reports,
        COUNT(*) FILTER (WHERE UPPER(status) = 'REJECTED') as rejected_reports
      FROM user_reports;
    `;

    // 4. User Funnel Telemetry (Driver Journey - Last 24h & All time)
    const funnelQuery = `
      SELECT 
        event_name,
        COUNT(*) as total_events,
        COUNT(DISTINCT session_id) as unique_users,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 HOURS') as today_events
      FROM driver_funnel_events
      GROUP BY event_name
      ORDER BY total_events DESC;
    `;

    // 5. Recent Activity (Latest 5 updated/created spots)
    const recentSpotsQuery = `
      SELECT id, name, category, address, status, verified, updated_at
      FROM places
      ORDER BY updated_at DESC
      LIMIT 5;
    `;

    const [statsRes, catRes, reportsRes, funnelRes, recentSpotsRes] = await Promise.all([
      pool.query(qualityQuery),
      pool.query(catQuery),
      pool.query(reportsQuery).catch(() => ({ rows: [{ total_reports: '0', pending_reports: '0', investigating_reports: '0', resolved_reports: '0', rejected_reports: '0' }] })),
      pool.query(funnelQuery).catch(() => ({ rows: [] })),
      pool.query(recentSpotsQuery).catch(() => ({ rows: [] }))
    ]);

    const stats = statsRes.rows[0];
    const totalSpots = parseInt(stats.total_spots || '0');
    const missingPhone = parseInt(stats.missing_phone || '0');
    const rawAddress = parseInt(stats.raw_coordinate_address || '0');
    const missingHours = parseInt(stats.missing_hours || '0');
    const missingImages = parseInt(stats.missing_images || '0');
    const verified = parseInt(stats.verified_spots || '0');

    // Calculate Data Health Score (0 - 100%)
    // Weights: Phone 25%, Hours 20%, Address 25%, Real Images 15%, Verified 15%
    const phoneScore = totalSpots > 0 ? ((totalSpots - missingPhone) / totalSpots) * 25 : 0;
    const hoursScore = totalSpots > 0 ? ((totalSpots - missingHours) / totalSpots) * 20 : 0;
    const addressScore = totalSpots > 0 ? ((totalSpots - rawAddress) / totalSpots) * 25 : 0;
    const imagesScore = totalSpots > 0 ? ((totalSpots - missingImages) / totalSpots) * 15 : 0;
    const verifiedScore = totalSpots > 0 ? (verified / totalSpots) * 15 : 0;
    const dataHealthScore = Math.round(phoneScore + hoursScore + addressScore + imagesScore + verifiedScore);

    const categoryBreakdown: Record<string, number> = {};
    catRes.rows.forEach((r: any) => {
      categoryBreakdown[r.category] = parseInt(r.count);
    });

    const rep = reportsRes.rows[0] || {};
    const reportsSummary = {
      total: parseInt(rep.total_reports || '0'),
      pending: parseInt(rep.pending_reports || '0'),
      investigating: parseInt(rep.investigating_reports || '0'),
      resolved: parseInt(rep.resolved_reports || '0'),
      rejected: parseInt(rep.rejected_reports || '0'),
    };

    const funnelMap: Record<string, any> = {};
    funnelRes.rows.forEach((r: any) => {
      funnelMap[r.event_name] = {
        total: parseInt(r.total_events),
        unique: parseInt(r.unique_users),
        today: parseInt(r.today_events || '0')
      };
    });

    return NextResponse.json({
      success: true,
      totalSpots,
      activeSpots: parseInt(stats.active_spots || '0'),
      pendingSpots: parseInt(stats.pending_spots || '0'),
      hiddenSpots: parseInt(stats.hidden_spots || '0'),
      verifiedSpots: verified,
      dataHealthScore,
      quality: {
        missingPhone,
        rawAddress,
        missingHours,
        missingImages,
        verified,
        unverified: parseInt(stats.unverified_spots || '0'),
        lowConfidence: parseInt(stats.low_confidence || '0'),
        categories: categoryBreakdown
      },
      reports: reportsSummary,
      activity: {
        homeOpened: funnelMap['home_opened']?.today || funnelMap['home_opened']?.total || 0,
        gpsGranted: funnelMap['gps_granted']?.today || funnelMap['gps_granted']?.total || 0,
        nearbyClicked: funnelMap['nearby_clicked']?.today || funnelMap['nearby_clicked']?.total || 0,
        navStarted: funnelMap['navigation_started']?.today || funnelMap['navigation_started']?.total || 0,
        favorited: funnelMap['spot_favorited']?.today || funnelMap['spot_favorited']?.total || 0,
        reported: funnelMap['spot_reported']?.today || funnelMap['spot_reported']?.total || 0,
        events: funnelRes.rows
      },
      recentSpots: recentSpotsRes.rows
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
