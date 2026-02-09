/**
 * Workspace Example Component
 * Demonstrates how to use the useWorkspaces hook
 */

import React, { useState } from 'react';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { Workspace } from '@/services/api/types';

export const WorkspaceExample: React.FC = () => {
  const {
    workspaces,
    selectedWorkspace,
    isLoading,
    error,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    selectWorkspace,
    generateSlug,
    validateSlug,
    clearError
  } = useWorkspaces();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  const handleNameChange = (newName: string) => {
    setName(newName);
    setSlug(generateSlug(newName));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSlug(slug)) {
      alert('Invalid slug! Use only lowercase letters, numbers, and hyphens.');
      return;
    }
    
    try {
      await createWorkspace({ name, slug, description });
      console.log('✓ Workspace created');
      setShowCreateForm(false);
      setName('');
      setSlug('');
      setDescription('');
    } catch (err) {
      console.error('✗ Failed to create workspace:', err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingWorkspace) return;
    
    try {
      await updateWorkspace(editingWorkspace.id, { name, description });
      console.log('✓ Workspace updated');
      setEditingWorkspace(null);
      setName('');
      setDescription('');
    } catch (err) {
      console.error('✗ Failed to update workspace:', err);
    }
  };

  const handleDelete = async (workspaceId: string, workspaceName: string) => {
    if (!confirm(`Are you sure you want to delete "${workspaceName}"?`)) {
      return;
    }
    
    try {
      await deleteWorkspace(workspaceId);
      console.log('✓ Workspace deleted');
    } catch (err) {
      console.error('✗ Failed to delete workspace:', err);
    }
  };

  const startEdit = (workspace: Workspace) => {
    setEditingWorkspace(workspace);
    setName(workspace.name);
    setDescription(workspace.description || '');
    setShowCreateForm(false);
  };

  const cancelForm = () => {
    setShowCreateForm(false);
    setEditingWorkspace(null);
    setName('');
    setSlug('');
    setDescription('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Workspace Management Example</h2>

      {/* Loading State */}
      {isLoading && (
        <div style={{ padding: '10px', background: '#f0f0f0', marginBottom: '10px' }}>
          Loading workspaces...
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{ 
          padding: '10px', 
          background: '#fee', 
          color: '#c00', 
          marginBottom: '10px',
          borderRadius: '4px'
        }}>
          {error}
          <button onClick={clearError} style={{ marginLeft: '10px' }}>✕</button>
        </div>
      )}

      {/* Create Workspace Button */}
      {!showCreateForm && !editingWorkspace && (
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            padding: '10px 20px',
            background: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          + Create Workspace
        </button>
      )}

      {/* Create/Edit Form */}
      {(showCreateForm || editingWorkspace) && (
        <div style={{ 
          border: '2px solid #2196F3', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3>{editingWorkspace ? 'Edit Workspace' : 'Create New Workspace'}</h3>
          <form onSubmit={editingWorkspace ? handleUpdate : handleCreate}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Name: *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => editingWorkspace ? setName(e.target.value) : handleNameChange(e.target.value)}
                placeholder="My Workspace"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
                required
              />
            </div>

            {!editingWorkspace && (
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Slug: * (auto-generated)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="my-workspace"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: validateSlug(slug) || !slug ? '1px solid #ccc' : '2px solid #f44336'
                  }}
                  required
                />
                {slug && !validateSlug(slug) && (
                  <small style={{ color: '#f44336' }}>
                    ⚠️ Only lowercase letters, numbers, and hyphens allowed
                  </small>
                )}
              </div>
            )}

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Description:
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                disabled={isLoading || (slug && !validateSlug(slug))}
                style={{
                  padding: '10px 20px',
                  background: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: (isLoading || (slug && !validateSlug(slug))) ? 'not-allowed' : 'pointer',
                  opacity: (isLoading || (slug && !validateSlug(slug))) ? 0.6 : 1
                }}
              >
                {isLoading ? 'Saving...' : editingWorkspace ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                style={{
                  padding: '10px 20px',
                  background: '#999',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Workspaces List */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Your Workspaces ({workspaces.length})</h3>
        {workspaces.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            No workspaces yet. Create your first workspace to get started!
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                onClick={() => selectWorkspace(workspace)}
                style={{
                  border: selectedWorkspace?.id === workspace.id ? '2px solid #2196F3' : '1px solid #ddd',
                  padding: '15px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: selectedWorkspace?.id === workspace.id ? '#e3f2fd' : 'white',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 5px 0' }}>{workspace.name}</h4>
                    <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                      {workspace.slug}
                    </p>
                    {workspace.description && (
                      <p style={{ margin: '0 0 10px 0', color: '#555' }}>
                        {workspace.description}
                      </p>
                    )}
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      <span>Created: {new Date(workspace.created_at).toLocaleDateString()}</span>
                      <span style={{ margin: '0 10px' }}>•</span>
                      <span>Updated: {new Date(workspace.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '5px', marginLeft: '15px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(workspace);
                      }}
                      style={{
                        padding: '5px 10px',
                        background: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(workspace.id, workspace.name);
                      }}
                      style={{
                        padding: '5px 10px',
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Workspace Details */}
      {selectedWorkspace && (
        <div style={{ 
          border: '2px solid #4caf50', 
          padding: '20px', 
          borderRadius: '8px',
          background: '#f1f8e9'
        }}>
          <h3 style={{ color: '#4caf50', marginTop: 0 }}>✓ Selected Workspace</h3>
          <pre style={{ 
            background: 'white', 
            padding: '15px', 
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '13px'
          }}>
            {JSON.stringify(selectedWorkspace, null, 2)}
          </pre>
        </div>
      )}

      {/* Usage Instructions */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: '#f9f9f9', 
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        <strong>📝 Usage Instructions:</strong>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>Click "Create Workspace" to add a new workspace</li>
          <li>Slug is auto-generated from the name (lowercase, hyphens)</li>
          <li>Click on a workspace to select it</li>
          <li>Use Edit/Delete buttons to manage workspaces</li>
          <li>Open browser console to see API calls</li>
          <li>If backend is unavailable, mock data is used automatically</li>
        </ul>
      </div>
    </div>
  );
};

export default WorkspaceExample;
