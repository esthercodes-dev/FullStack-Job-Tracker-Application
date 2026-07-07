import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();


  // State management
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total: 0, applied: 0, interview: 0, offer: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  // Form state for adding new application
  const [formData, setFormData] = useState({
    companyName: '',
    position: '',
    applicationUrl: '',
    status: 'Applied',
    location: '',
    salaryRange: '',
    notes: ''
  });

  // Fetch applications and stats when component loads
  useEffect(() => {
    fetchApplications();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, searchTerm]);

  /*const fetchApplications = async () => {
    try {
      const url = filterStatus ? `/applications?status=${filterStatus}` : '/applications';
      */
const fetchApplications = async () => {
  try {
    setError('');
    let url = '/applications?';
    if (filterStatus) url += `status=${filterStatus}&`;
    if (searchTerm) url += `search=${searchTerm}`;

      const response = await API.get(url);
      setApplications(response.data.applications);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await API.get('/applications/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddApplication = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/applications', formData);
      setShowAddModal(false);
      // Reset form
      setFormData({
        companyName: '',
        position: '',
        applicationUrl: '',
        status: 'Applied',
        location: '',
        salaryRange: '',
        notes: ''
      });
      // Refresh data
      fetchApplications();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await API.put(`/applications/${id}`, { status: newStatus });
      fetchApplications();
      fetchStats();
    } catch {
      alert('Failed to update status');54
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await API.delete(`/applications/${id}`);
        fetchApplications();
        fetchStats();
      } catch {
        alert('Failed to delete application');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Job Application Tracker</h1>
          <p style={styles.subtitle}>Welcome back, {user?.name}!</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>

      {error && (
  <div style={styles.errorBanner}>
    ⚠️ {error}
  </div>
)}

      {/* Statistics Cards */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #3b82f6' }}>
          <p style={styles.statLabel}>Total Applications</p>
          <p style={styles.statValue}>{stats.total}</p>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #fbbf24' }}>
          <p style={styles.statLabel}>Applied</p>
          <p style={styles.statValue}>{stats.applied}</p>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #8b5cf6' }}>
          <p style={styles.statLabel}>Interviews</p>
          <p style={styles.statValue}>{stats.interview}</p>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #10b981' }}>
          <p style={styles.statLabel}>Offers</p>
          <p style={styles.statValue}>{stats.offer}</p>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #ef4444' }}>
          <p style={styles.statLabel}>Rejected</p>
          <p style={styles.statValue}>{stats.rejected}</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div style={styles.actionsBar}>
        <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>
          + Add New Application
        </button>

        <input
    type="text"
    placeholder="Search by company or position..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    style={styles.searchInput}
  />
        
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="">All Applications</option>
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Applications Table */}
      {applications.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No applications yet!</p>
          <p style={styles.emptySubtext}>Click "Add New Application" to get started.</p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Company</th>
                <th style={styles.th}>Position</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date Applied</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id} style={styles.tableRow}>
                  <td style={styles.td}>
                    <strong>{app.companyName}</strong>
                  </td>
                  <td style={styles.td}>{app.position}</td>
                  <td style={styles.td}>{app.location || 'N/A'}</td>
                  <td style={styles.td}>
                    <select
                      value={app.status}
                      onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                      style={getStatusStyle(app.status)}
                    >
                      <option value="Applied">Applied</option>
                      <option value="Interview">Interview</option>
                      <option value="Offer">Offer</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                  <td style={styles.td}>{formatDate(app.dateApplied)}</td>
                  <td style={styles.td}>
                    <button 
    onClick={() => setSelectedApp(app)}
    style={styles.viewBtn}
  >
    View
    </button>
                    <button 
                      onClick={() => handleDelete(app._id)}
                      style={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Application Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Add New Application</h2>
            <form onSubmit={handleAddApplication}>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Company Name *</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Position *</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Application URL</label>
                  <input
                    type="url"
                    name="applicationUrl"
                    value={formData.applicationUrl}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    style={styles.input}
                  >
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Salary Range</label>
                  <input
                    type="text"
                    name="salaryRange"
                    value={formData.salaryRange}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  style={{ ...styles.input, resize: 'vertical' }}
                />
              </div>

              <div style={styles.modalActions}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} style={styles.submitBtn}>
                  {submitting ? 'Adding...' : 'Add Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedApp && (
  <div style={styles.modalOverlay} onClick={() => setSelectedApp(null)}>
    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
      <h2 style={styles.modalTitle}>Application Details</h2>
      
      <div style={styles.detailsGrid}>
        <div style={styles.detailItem}>
          <strong>Company:</strong> {selectedApp.companyName}
        </div>
        <div style={styles.detailItem}>
          <strong>Position:</strong> {selectedApp.position}
        </div>
        <div style={styles.detailItem}>
          <strong>Status:</strong> 
          <span style={getStatusBadge(selectedApp.status)}>
            {selectedApp.status}
          </span>
        </div>
        <div style={styles.detailItem}>
          <strong>Location:</strong> {selectedApp.location || 'Not specified'}
        </div>
        <div style={styles.detailItem}>
          <strong>Salary Range:</strong> {selectedApp.salaryRange || 'Not specified'}
        </div>
        <div style={styles.detailItem}>
          <strong>Date Applied:</strong> {formatDate(selectedApp.dateApplied)}
        </div>
        {selectedApp.applicationUrl && (
          <div style={styles.detailItem}>
            <strong>Application URL:</strong> 
            <a href={selectedApp.applicationUrl} target="_blank" rel="noopener noreferrer" style={styles.link}>
              View Application
            </a>
          </div>
        )}
        {selectedApp.notes && (
          <div style={{ ...styles.detailItem, gridColumn: '1 / -1' }}>
            <strong>Notes:</strong>
            <p style={{ marginTop: '8px', lineHeight: '1.5' }}>{selectedApp.notes}</p>
          </div>
        )}
      </div>
      
      <div style={styles.modalActions}>
        <button onClick={() => setSelectedApp(null)} style={styles.cancelBtn}>
          Close
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}


// Status color helper
function getStatusStyle(status) {
  const baseStyle = {
    padding: '6px 12px',
    borderRadius: '4px',
    border: '1px solid',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  };

  const colors = {
    Applied: { bg: '#fef3c7', border: '#fbbf24', color: '#92400e' },
    Interview: { bg: '#e9d5ff', border: '#8b5cf6', color: '#581c87' },
    Offer: { bg: '#d1fae5', border: '#10b981', color: '#065f46' },
    Rejected: { bg: '#fee2e2', border: '#ef4444', color: '#991b1b' }
  };

  return {
    ...baseStyle,
    backgroundColor: colors[status].bg,
    borderColor: colors[status].border,
    color: colors[status].color
  };
}

// Add this function before the styles object
function getStatusBadge(status) {
  const colors = {
    Applied: { bg: '#fef3c7', color: '#92400e' },
    Interview: { bg: '#e9d5ff', color: '#581c87' },
    Offer: { bg: '#d1fae5', color: '#065f46' },
    Rejected: { bg: '#fee2e2', color: '#991b1b' }
  };

  return {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    marginLeft: '8px',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: colors[status].bg,
    color: colors[status].color
  };
}

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '20px'
  },

searchInput: {
  padding: '10px 15px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
  width: '300px',
  outline: 'none'
},
detailsGrid: {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px',
  marginBottom: '20px'
},
detailItem: {
  fontSize: '14px',
  color: '#374151'
},
link: {
  color: '#3b82f6',
  textDecoration: 'none',
  marginLeft: '8px'
},

  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '18px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    marginTop: '5px'
  },
  logoutBtn: {
    padding: '10px 20px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  errorBanner: {
  backgroundColor: '#fee2e2',
  color: '#991b1b',
  padding: '12px 20px',
  borderRadius: '6px',
  marginBottom: '20px',
  border: '1px solid #ef4444'
},
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '8px'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#111827'
  },
  actionsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    gap: '15px',
    flexWrap: 'wrap'
  },
  addBtn: {
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '16px'
  },
  filterSelect: {
    padding: '10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '8px'
  },
  emptyText: {
    fontSize: '20px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#6b7280'
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
    borderBottom: '2px solid #e5e7eb'
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb'
  },
  td: {
    padding: '16px 12px',
    fontSize: '14px',
    color: '#111827'
  },
  deleteBtn: {
    padding: '6px 12px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #ef4444',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500'
  },
  viewBtn: {
  padding: '6px 12px',
  backgroundColor: '#dbeafe',
  color: '#1e40af',
  border: '1px solid #3b82f6',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '500',
  marginRight: '8px'
},
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#111827'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px',
    marginBottom: '15px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    marginBottom: '5px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },
  input: {
    padding: '10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px'
  },
  cancelBtn: {
    padding: '10px 20px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  submitBtn: {
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500'
  }
};

export default Dashboard;