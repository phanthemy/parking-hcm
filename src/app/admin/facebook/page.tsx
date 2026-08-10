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

  // Spot search for matching
  const [matchingPostId, setMatchingPostId] = useState<string | null>(null);
  const [spotSearch, setSpotSearch] = useState('');
  const [spotResults, setSpotResults] = useState<{ id: string; name: string; address: string }[]>([]);

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
      setMatchingPostId(null);
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
    await api.delete('/api/admin/facebook/configs', { data: { id } });
    fetchConfigs();
  };

  // Spot search
  const searchSpots = async (q: string) => {
    setSpotSearch(q);
    if (q.length < 2) { setSpotResults([]); return; }
    try {
      const res = await api.get<{ spots: any[] }>(`/api/spots?search=${q}&limit=5`);
      setSpotResults((res.spots || []).map((s: any) => ({ id: s.id, name: s.name, address: s.address })));
    } catch { setSpotResults([]); }
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
                          
                          {/* Match with Spot button */}
                          <button
                            onClick={() => setMatchingPostId(matchingPostId === post.id ? null : post.id)}
                            style={{
                              padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.4)',
                              background: matchingPostId === post.id ? 'rgba(59,130,246,0.15)' : 'transparent',
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

                        {/* Spot Matching Dropdown */}
                        {matchingPostId === post.id && (
                          <div style={{
                            marginTop: '12px', padding: '12px', background: 'rgba(59,130,246,0.08)',
                            borderRadius: '10px', border: '1px solid rgba(59,130,246,0.2)'
                          }}>
                            <input
                              type="text"
                              placeholder="Tìm bãi xe để gán..."
                              value={spotSearch}
                              onChange={e => searchSpots(e.target.value)}
                              style={{
                                width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
                                color: '#fff', fontSize: '13px'
                              }}
                            />
                            {spotResults.length > 0 && (
                              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {spotResults.map(s => (
                                  <button
                                    key={s.id}
                                    onClick={() => handleAction(post.id, 'approve', s.id)}
                                    style={{
                                      padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                                      background: 'rgba(255,255,255,0.04)', color: '#fff', cursor: 'pointer',
                                      textAlign: 'left', fontSize: '13px'
                                    }}
                                  >
                                    🅿️ <strong>{s.name}</strong> — <span style={{ opacity: 0.5, fontSize: '11px' }}>{s.address}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
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
