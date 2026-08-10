'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';

interface FbImage {
  id: string;
  url: string;
  type: string;
}

interface FbPost {
  id: string;
  fbPostId: string;
  groupUrl: string;
  content: string;
  authorName: string | null;
  postDate: string;
  isComment: boolean;
  status: string;
  matchedSpotId: string | null;
  matchedSpot: { id: string; name: string } | null;
  images: FbImage[];
  createdAt: string;
}

interface CrawlConfig {
  id: string;
  groupUrl: string;
  groupName: string;
  isActive: boolean;
  lastCrawl: string | null;
}

interface PaginatedResponse {
  posts: FbPost[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminFacebookPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'configs'>('posts');

  // Posts state
  const [posts, setPosts] = useState<FbPost[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Configs state
  const [configs, setConfigs] = useState<CrawlConfig[]>([]);
  const [newGroupUrl, setNewGroupUrl] = useState('');
  const [newGroupName, setNewGroupName] = useState('');

  // Lightbox state
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Smart extraction modal
  const [extractModal, setExtractModal] = useState<{
    postId: string;
    extracted: {
      name: string; address: string; phone: string; pricePerHour: number;
      priceMonthly: string; type: string; features: string[];
    };
    existingSpots: { id: string; name: string; address: string }[];
    postImages: string[];
    loading: boolean;
  } | null>(null);
  const [editExtracted, setEditExtracted] = useState<any>(null);
  const [geoResult, setGeoResult] = useState<{ lat: number; lng: number; formattedAddress: string } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    const role = user?.role?.toString().toUpperCase();
    if (!authLoading && (!isAuthenticated || role !== 'ADMIN')) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get<PaginatedResponse>(`/api/admin/facebook?status=${statusFilter}&page=${currentPage}&limit=15`);
      setPosts(res.posts || []);
      setTotalPages(res.totalPages || 1);
      setTotalPosts(res.total || 0);
    } catch {
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, currentPage]);

  const fetchConfigs = useCallback(async () => {
    try {
      const res = await api.get<{ configs: CrawlConfig[] }>('/api/admin/facebook/configs');
      setConfigs(res.configs || []);
    } catch {
      setConfigs([]);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
      fetchConfigs();
    }
  }, [isAuthenticated, fetchPosts, fetchConfigs]);

  // Post actions
  const handleAction = async (postId: string, action: 'approve' | 'reject' | 'delete', matchedSpotId?: string) => {
    setActionLoading(postId);
    try {
      await api.patch('/api/admin/facebook', { id: postId, action, matchedSpotId });
      if (action === 'delete') {
        setPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: action === 'approve' ? 'approved' : 'rejected' } : p));
      }
    } catch (err: any) {
      alert('Lỗi: ' + (err.message || 'Thử lại'));
    } finally {
      setActionLoading(null);
    }
  };

  // Batch actions
  const handleBatchApprove = async () => {
    const pending = posts.filter(p => p.status === 'pending');
    if (!pending.length) return;
    if (!confirm(`Duyệt tất cả ${pending.length} bài đang chờ?`)) return;
    for (const p of pending) {
      await handleAction(p.id, 'approve');
    }
    fetchPosts();
  };

  // Config actions
  const handleAddGroup = async () => {
    if (!newGroupUrl.trim()) return;
    try {
      await api.post('/api/admin/facebook/configs', { groupUrl: newGroupUrl, groupName: newGroupName || 'Nhóm FB' });
      setNewGroupUrl('');
      setNewGroupName('');
      fetchConfigs();
    } catch (err: any) {
      alert('Lỗi: ' + (err.message || 'Thử lại'));
    }
  };

  const handleToggleConfig = async (id: string, isActive: boolean) => {
    await api.patch('/api/admin/facebook/configs', { id, isActive: !isActive });
    fetchConfigs();
  };

  const handleDeleteConfig = async (id: string) => {
    if (!confirm('Xóa nhóm này?')) return;
    await fetch('/api/admin/facebook/configs', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchConfigs();
  };

  // Smart extract & assign
  // Geocode address to lat/lng
  const handleGeocode = async (address: string) => {
    if (!address || address.length < 5) return;
    setGeoLoading(true);
    try {
      const res = await api.post<any>('/api/admin/facebook/geocode', { address });
      if (res.lat && res.lng) {
        setGeoResult({ lat: res.lat, lng: res.lng, formattedAddress: res.formattedAddress || address });
      } else {
        setGeoResult(null);
      }
    } catch {
      setGeoResult(null);
    } finally {
      setGeoLoading(false);
    }
  };

  const handleExtract = async (postId: string) => {
    setExtractModal({ postId, extracted: { name: '', address: '', phone: '', pricePerHour: 0, priceMonthly: '', type: 'PARKING_LOT', features: [] }, existingSpots: [], postImages: [], loading: true });
    setGeoResult(null);
    try {
      const res = await api.post<any>('/api/admin/facebook/extract', { postId });
      setExtractModal({ postId, ...res, loading: false });
      setEditExtracted({ ...res.extracted });
      // Auto-geocode if address found
      if (res.extracted?.address) {
        handleGeocode(res.extracted.address);
      }
    } catch {
      alert('Không thể trích xuất. Thử lại.');
      setExtractModal(null);
    }
  };

  const handleCreateSpot = async () => {
    if (!extractModal || !editExtracted) return;
    if (!geoResult) {
      if (!confirm('⚠️ Chưa có tọa độ! Bãi xe sẽ được đặt ở vị trí mặc định. Tiếp tục?')) return;
    }
    try {
      await api.put('/api/admin/facebook/extract', {
        postId: extractModal.postId,
        name: editExtracted.name,
        address: geoResult?.formattedAddress || editExtracted.address,
        phone: editExtracted.phone,
        type: editExtracted.type,
        pricePerHour: editExtracted.pricePerHour,
        lat: geoResult?.lat || 10.78,
        lng: geoResult?.lng || 106.69,
        images: extractModal.postImages
      });
      setExtractModal(null);
      setEditExtracted(null);
      fetchPosts();
      alert('✅ Đã tạo bãi xe mới và gán bài viết!');
    } catch (err: any) {
      alert('Lỗi: ' + (err.message || 'Thử lại'));
    }
  };

  const handleAssignExisting = async (spotId: string) => {
    if (!extractModal) return;
    await handleAction(extractModal.postId, 'approve', spotId);
    setExtractModal(null);
    setEditExtracted(null);
  };

  const statusColors: Record<string, string> = {
    pending: '#f59e0b',
    approved: '#10b981',
    rejected: '#ef4444',
  };

  const statusLabels: Record<string, string> = {
    pending: '⏳ Chờ duyệt',
    approved: '✅ Đã duyệt',
    rejected: '❌ Từ chối',
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          <div className="skeleton" style={{ height: '100px', borderRadius: '12px', marginBottom: '16px' }} />
          <div className="skeleton" style={{ height: '400px', borderRadius: '12px' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', flex: 1 }}>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>📱 Facebook Crawler</h1>
            <p style={{ fontSize: '13px', opacity: 0.5, marginTop: '4px' }}>Quản lý bài viết crawl từ Facebook Groups</p>
          </div>
          <button
            className="btn-secondary"
            onClick={() => router.push('/admin')}
            style={{ fontSize: '13px', padding: '8px 16px' }}
          >
            ← Về trang quản trị
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px' }}>
          <button
            onClick={() => setActiveTab('posts')}
            style={{
              flex: 1, padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: activeTab === 'posts' ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'transparent',
              color: activeTab === 'posts' ? '#fff' : '#a0a0b0', fontWeight: 600, fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            📝 Bài viết ({totalPosts})
          </button>
          <button
            onClick={() => setActiveTab('configs')}
            style={{
              flex: 1, padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: activeTab === 'configs' ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'transparent',
              color: activeTab === 'configs' ? '#fff' : '#a0a0b0', fontWeight: 600, fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            ⚙️ Nhóm Facebook ({configs.length})
          </button>
        </div>

        {/* ============ POSTS TAB ============ */}
        {activeTab === 'posts' && (
          <>
            {/* Status Filters */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              {['all', 'pending', 'approved', 'rejected'].map(s => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                  style={{
                    padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                    background: statusFilter === s ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'rgba(255,255,255,0.06)',
                    color: statusFilter === s ? '#fff' : '#a0a0b0', fontSize: '13px',
                    fontWeight: statusFilter === s ? 600 : 400, transition: 'all 0.2s'
                  }}
                >
                  {s === 'all' ? '🌐 Tất cả' : statusLabels[s]} 
                </button>
              ))}
              
              <div style={{ flex: 1 }} />
              
              <button
                onClick={handleBatchApprove}
                className="btn-primary"
                style={{ fontSize: '12px', padding: '8px 14px' }}
              >
                ✅ Duyệt tất cả
              </button>
            </div>

            {/* Posts Grid */}
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <p style={{ opacity: 0.6 }}>⏳ Đang tải bài viết...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
                <p style={{ fontSize: '48px', marginBottom: '12px' }}>📭</p>
                <p style={{ fontWeight: 600 }}>Không có bài viết nào</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {posts.map(post => (
                  <div
                    key={post.id}
                    className="card"
                    style={{
                      padding: '20px',
                      opacity: actionLoading === post.id ? 0.5 : 1,
                      transition: 'all 0.2s',
                      borderLeft: `4px solid ${statusColors[post.status] || '#6b7280'}`
                    }}
                  >
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {/* Text Content */}
                      <div style={{ flex: '1 1 300px', minWidth: 0 }}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                            background: `${statusColors[post.status]}22`, color: statusColors[post.status]
                          }}>
                            {statusLabels[post.status]}
                          </span>
                          {post.authorName && (
                            <span style={{ fontSize: '12px', color: '#a0a0b0' }}>👤 {post.authorName}</span>
                          )}
                          <span style={{ fontSize: '11px', color: '#6b7280' }}>
                            {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                          {post.matchedSpot && (
                            <span style={{
                              padding: '2px 8px', borderRadius: '8px', fontSize: '11px',
                              background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 600
                            }}>
                              🅿️ {post.matchedSpot.name}
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <p style={{
                          fontSize: '14px', lineHeight: '1.6', margin: '0 0 12px 0',
                          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' as any,
                          wordBreak: 'break-word'
                        }}>
                          {post.content}
                        </p>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                          {post.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAction(post.id, 'approve')}
                                disabled={!!actionLoading}
                                style={{
                                  padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                  background: '#10b981', color: '#fff', fontSize: '12px', fontWeight: 600
                                }}
                              >
                                ✅ Duyệt
                              </button>
                              <button
                                onClick={() => handleAction(post.id, 'reject')}
                                disabled={!!actionLoading}
                                style={{
                                  padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.4)',
                                  background: 'transparent', color: '#ef4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                                }}
                              >
                                ❌ Từ chối
                              </button>
                            </>
                          )}
                          
                          {/* Smart Extract & Assign button */}
                          <button
                            onClick={() => handleExtract(post.id)}
                            style={{
                              padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.4)',
                              background: 'transparent',
                              color: '#3b82f6', fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                            }}
                          >
                            🔗 Gán bãi xe
                          </button>

                          <button
                            onClick={() => { if (confirm('Xóa bài này?')) handleAction(post.id, 'delete'); }}
                            disabled={!!actionLoading}
                            style={{
                              padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                              background: 'transparent', color: '#6b7280', fontSize: '12px', cursor: 'pointer'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Images Grid */}
                      {post.images.length > 0 && (
                        <div style={{
                          flex: '0 0 auto', display: 'grid',
                          gridTemplateColumns: `repeat(${Math.min(post.images.length, 3)}, 90px)`,
                          gap: '6px', alignSelf: 'flex-start'
                        }}>
                          {post.images.slice(0, 6).map((img, i) => (
                            <div
                              key={img.id}
                              onClick={() => setLightboxImg(img.url)}
                              style={{
                                width: '90px', height: '90px', borderRadius: '8px', overflow: 'hidden',
                                cursor: 'pointer', position: 'relative', border: '1px solid rgba(255,255,255,0.1)'
                              }}
                            >
                              {img.type === 'video' ? (
                                <video src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                              ) : (
                                <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={e => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }} />
                              )}
                              {i === 5 && post.images.length > 6 && (
                                <div style={{
                                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: '#fff', fontWeight: 700, fontSize: '16px'
                                }}>
                                  +{post.images.length - 6}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px', alignItems: 'center'
              }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '13px' }}
                >
                  ◀ Trước
                </button>
                <span style={{ fontSize: '13px', color: '#a0a0b0' }}>
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '13px' }}
                >
                  Sau ▶
                </button>
              </div>
            )}
          </>
        )}

        {/* ============ CONFIGS TAB ============ */}
        {activeTab === 'configs' && (
          <>
            {/* Add New Group */}
            <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>➕ Thêm nhóm Facebook mới</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="URL nhóm (vd: https://facebook.com/groups/...)"
                  value={newGroupUrl}
                  onChange={e => setNewGroupUrl(e.target.value)}
                  style={{
                    flex: '2 1 300px', padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '14px'
                  }}
                />
                <input
                  type="text"
                  placeholder="Tên nhóm (tuỳ chọn)"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  style={{
                    flex: '1 1 200px', padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '14px'
                  }}
                />
                <button onClick={handleAddGroup} className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px', fontWeight: 600 }}>
                  ➕ Thêm
                </button>
              </div>
            </div>

            {/* Configs List */}
            <div style={{ display: 'grid', gap: '12px' }}>
              {configs.map(config => (
                <div key={config.id} className="card" style={{
                  padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
                  borderLeft: `4px solid ${config.isActive ? '#10b981' : '#6b7280'}`
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '15px', margin: '0 0 4px 0' }}>{config.groupName}</p>
                    <p style={{ fontSize: '12px', color: '#a0a0b0', margin: 0, wordBreak: 'break-all' }}>{config.groupUrl}</p>
                    {config.lastCrawl && (
                      <p style={{ fontSize: '11px', color: '#6b7280', margin: '4px 0 0 0' }}>
                        🕐 Crawl lần cuối: {new Date(config.lastCrawl).toLocaleString('vi-VN')}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleToggleConfig(config.id, config.isActive)}
                      style={{
                        padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                        background: config.isActive ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                        color: config.isActive ? '#ef4444' : '#10b981'
                      }}
                    >
                      {config.isActive ? '⏸️ Tạm dừng' : '▶️ Bật lại'}
                    </button>
                    <button
                      onClick={() => handleDeleteConfig(config.id)}
                      style={{
                        padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                        background: 'transparent', color: '#6b7280', cursor: 'pointer', fontSize: '12px'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}

              {configs.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ fontSize: '40px', marginBottom: '8px' }}>📱</p>
                  <p style={{ fontWeight: 600 }}>Chưa có nhóm nào</p>
                  <p style={{ fontSize: '13px', opacity: 0.5 }}>Thêm URL nhóm Facebook ở trên để bắt đầu crawl</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Smart Extraction Modal */}
      {extractModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: '#13131a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px',
            width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>🔗 Gán bãi xe từ bài viết</h3>
              <button onClick={() => { setExtractModal(null); setEditExtracted(null); }}
                style={{ background: 'none', border: 'none', color: '#a0a0b0', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>

            {extractModal.loading ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <p style={{ fontSize: '32px' }}>🔍</p>
                <p style={{ opacity: 0.6 }}>Đang trích xuất thông tin...</p>
              </div>
            ) : editExtracted && (
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Auto-extracted info */}
                <div style={{
                  padding: '12px 16px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.1))',
                  border: '1px solid rgba(16,185,129,0.2)'
                }}>
                  <p style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, margin: '0 0 8px 0' }}>
                    🤖 AI đã tự trích xuất thông tin — chỉnh sửa nếu cần:
                  </p>
                  {editExtracted.features?.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {editExtracted.features.map((f: string, i: number) => (
                        <span key={i} style={{
                          padding: '2px 8px', borderRadius: '12px', fontSize: '11px',
                          background: 'rgba(59,130,246,0.15)', color: '#93c5fd'
                        }}>{f}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Editable fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#a0a0b0', marginBottom: '4px' }}>Tên bãi xe</label>
                    <input type="text" value={editExtracted.name}
                      onChange={e => setEditExtracted({ ...editExtracted, name: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '14px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#a0a0b0', marginBottom: '4px' }}>Loại</label>
                    <select value={editExtracted.type}
                      onChange={e => setEditExtracted({ ...editExtracted, type: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', background: '#1c1c28', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '14px' }}>
                      <option value="PARKING_LOT">🅿️ Bãi đỗ xe</option>
                      <option value="CARWASH">🚿 Rửa xe</option>
                      <option value="GARAGE">🔧 Garage</option>
                      <option value="SERVICE">🏢 Dịch vụ khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#a0a0b0', marginBottom: '4px' }}>📍 Địa chỉ</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" value={editExtracted.address}
                      onChange={e => setEditExtracted({ ...editExtracted, address: e.target.value })}
                      onBlur={() => editExtracted.address && handleGeocode(editExtracted.address)}
                      placeholder="Nhập địa chỉ để tự tìm tọa độ..."
                      style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '14px' }} />
                    <button
                      onClick={() => handleGeocode(editExtracted.address)}
                      disabled={geoLoading || !editExtracted.address}
                      style={{
                        padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        background: geoLoading ? '#4b5563' : 'linear-gradient(135deg, #10b981, #059669)',
                        color: '#fff', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap'
                      }}
                    >
                      {geoLoading ? '⏳...' : '📍 Tìm vị trí'}
                    </button>
                  </div>

                  {/* Geocode Result + Mini Map */}
                  {geoResult && (
                    <div style={{ marginTop: '10px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(16,185,129,0.3)' }}>
                      <div style={{ padding: '8px 12px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>✅</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, margin: 0 }}>Đã tìm thấy vị trí!</p>
                          <p style={{ fontSize: '11px', color: '#a0a0b0', margin: '2px 0 0 0' }}>{geoResult.formattedAddress}</p>
                        </div>
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>{geoResult.lat.toFixed(5)}, {geoResult.lng.toFixed(5)}</span>
                      </div>
                      <iframe
                        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || 'AIzaSyCaf1H1dOg1sQvCE0-UHiXogHSlcRe0FTg'}&q=${geoResult.lat},${geoResult.lng}&zoom=17&maptype=roadmap`}
                        style={{ width: '100%', height: '180px', border: 'none' }}
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  )}

                  {geoLoading && (
                    <p style={{ fontSize: '12px', color: '#f59e0b', marginTop: '8px' }}>🔍 Đang tìm tọa độ từ địa chỉ...</p>
                  )}

                  {!geoResult && !geoLoading && editExtracted.address && (
                    <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>💡 Nhấn "Tìm vị trí" hoặc rời ô địa chỉ để tự tìm tọa độ</p>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#a0a0b0', marginBottom: '4px' }}>Số điện thoại</label>
                    <input type="text" value={editExtracted.phone}
                      onChange={e => setEditExtracted({ ...editExtracted, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '14px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#a0a0b0', marginBottom: '4px' }}>Giá {editExtracted.priceMonthly || ''}</label>
                    <input type="number" value={editExtracted.pricePerHour}
                      onChange={e => setEditExtracted({ ...editExtracted, pricePerHour: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '14px' }} />
                  </div>
                </div>

                {/* Post images */}
                {extractModal.postImages.length > 0 && (
                  <div>
                    <p style={{ fontSize: '12px', color: '#a0a0b0', marginBottom: '8px' }}>📸 Ảnh sẽ được thêm ({extractModal.postImages.length})</p>
                    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
                      {extractModal.postImages.map((url, i) => (
                        <img key={i} src={url} alt="" style={{ width: '70px', height: '70px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Existing spots match */}
                {extractModal.existingSpots.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#f59e0b', marginBottom: '8px' }}>
                      ⚠️ Có thể trùng với bãi xe đã có:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {extractModal.existingSpots.map(s => (
                        <button key={s.id} onClick={() => handleAssignExisting(s.id)} style={{
                          padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.3)',
                          background: 'rgba(245,158,11,0.08)', color: '#fff', cursor: 'pointer', textAlign: 'left', fontSize: '13px'
                        }}>
                          🅿️ <strong>{s.name}</strong> — <span style={{ opacity: 0.5, fontSize: '11px' }}>{s.address}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                  <button onClick={() => { setExtractModal(null); setEditExtracted(null); }}
                    className="btn-secondary" style={{ padding: '10px 20px', fontSize: '14px' }}>
                    ✕ Hủy
                  </button>
                  <button onClick={handleCreateSpot}
                    className="btn-primary" style={{ padding: '10px 24px', fontSize: '14px', fontWeight: 700 }}>
                    ➕ Tạo bãi xe mới
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(8px)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', padding: '20px'
          }}
        >
          <img
            src={lightboxImg}
            alt=""
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '12px', objectFit: 'contain' }}
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxImg(null)}
            style={{
              position: 'fixed', top: '20px', right: '20px', background: 'rgba(255,255,255,0.2)',
              border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer',
              width: '40px', height: '40px', borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
