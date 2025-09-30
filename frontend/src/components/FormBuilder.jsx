import React, { useState, useEffect } from 'react';

const FormBuilder = ({ form, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft',
    deadline: '',
    allow_multiple_submissions: false,
    form_settings: {},
    fields: []
  });

  const [draggedField, setDraggedField] = useState(null);
  const [editingField, setEditingField] = useState(null);

  const fieldTypes = [
    { type: 'text', label: 'Text Input', icon: '📝' },
    { type: 'textarea', label: 'Text Area', icon: '📄' },
    { type: 'email', label: 'Email', icon: '📧' },
    { type: 'number', label: 'Number', icon: '🔢' },
    { type: 'date', label: 'Date', icon: '📅' },
    { type: 'select', label: 'Dropdown', icon: '📋' },
    { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
    { type: 'file', label: 'File Upload', icon: '📎' }
  ];

  useEffect(() => {
    if (form) {
      setFormData({
        title: form.title || '',
        description: form.description || '',
        status: form.status || 'draft',
        deadline: form.deadline ? new Date(form.deadline).toISOString().slice(0, 16) : '',
        allow_multiple_submissions: form.allow_multiple_submissions || false,
        form_settings: form.form_settings || {},
        fields: form.fields || []
      });
    }
  }, [form]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFieldChange = (fieldIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map((f, index) => 
        index === fieldIndex ? { ...f, [field]: value } : f
      )
    }));
  };

  const addField = (fieldType) => {
    const newField = {
      field_name: `field_${Date.now()}`,
      field_label: `New ${fieldType.label}`,
      field_type: fieldType.type,
      field_description: '',
      is_required: false,
      field_options: fieldType.type === 'select' || fieldType.type === 'checkbox' ? ['Option 1', 'Option 2'] : null,
      validation_rules: {},
      sort_order: formData.fields.length,
      is_active: true
    };

    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const removeField = (fieldIndex) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter((_, index) => index !== fieldIndex)
    }));
  };

  const moveField = (fromIndex, toIndex) => {
    const fields = [...formData.fields];
    const [movedField] = fields.splice(fromIndex, 1);
    fields.splice(toIndex, 0, movedField);
    
    // Update sort_order
    const updatedFields = fields.map((field, index) => ({
      ...field,
      sort_order: index
    }));

    setFormData(prev => ({
      ...prev,
      fields: updatedFields
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const renderFieldEditor = (field, fieldIndex) => {
    return (
      <div key={fieldIndex} className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {fieldTypes.find(ft => ft.type === field.field_type)?.icon}
            </span>
            <span className="font-semibold text-gray-700">
              {field.field_label}
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {field.field_type}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditingField(editingField === fieldIndex ? null : fieldIndex)}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
            >
              {editingField === fieldIndex ? 'Done' : 'Edit'}
            </button>
            <button
              onClick={() => removeField(fieldIndex)}
              className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>

        {editingField === fieldIndex && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Field Label</label>
                <input
                  type="text"
                  value={field.field_label}
                  onChange={(e) => handleFieldChange(fieldIndex, 'field_label', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Field Name</label>
                <input
                  type="text"
                  value={field.field_name}
                  onChange={(e) => handleFieldChange(fieldIndex, 'field_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={field.field_description}
                onChange={(e) => handleFieldChange(fieldIndex, 'field_description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Optional description for this field"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={field.is_required}
                  onChange={(e) => handleFieldChange(fieldIndex, 'is_required', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-semibold text-gray-700">Required Field</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={field.is_active}
                  onChange={(e) => handleFieldChange(fieldIndex, 'is_active', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-semibold text-gray-700">Active</span>
              </label>
            </div>

            {(field.field_type === 'select' || field.field_type === 'checkbox') && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Options (one per line)</label>
                <textarea
                  value={field.field_options?.join('\n') || ''}
                  onChange={(e) => handleFieldChange(fieldIndex, 'field_options', e.target.value.split('\n').filter(opt => opt.trim()))}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                />
              </div>
            )}

            {field.field_type === 'file' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>File Upload:</strong> This field will allow users to upload files. 
                  Supported formats: PDF, DOC, DOCX, JPG, PNG. Max size: 5MB.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Field Preview */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {field.field_label}
            {field.is_required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.field_description && (
            <p className="text-xs text-gray-600 mb-2">{field.field_description}</p>
          )}
          
          {field.field_type === 'text' && (
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Enter text..."
              disabled
            />
          )}
          
          {field.field_type === 'textarea' && (
            <textarea
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Enter text..."
              disabled
            />
          )}
          
          {field.field_type === 'email' && (
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Enter email..."
              disabled
            />
          )}
          
          {field.field_type === 'number' && (
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Enter number..."
              disabled
            />
          )}
          
          {field.field_type === 'date' && (
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              disabled
            />
          )}
          
          {field.field_type === 'select' && (
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" disabled>
              <option>Select an option...</option>
              {field.field_options?.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          )}
          
          {field.field_type === 'checkbox' && (
            <div className="space-y-2">
              {field.field_options?.map((option, index) => (
                <label key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    disabled
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          )}
          
          {field.field_type === 'file' && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Click to upload file</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Form Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Form Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Form Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Enter form title"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Deadline</label>
            <input
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => handleInputChange('deadline', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.allow_multiple_submissions}
                onChange={(e) => handleInputChange('allow_multiple_submissions', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-semibold text-gray-700">Allow Multiple Submissions</span>
            </label>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Enter form description"
          />
        </div>
      </div>

      {/* Field Types */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Fields</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {fieldTypes.map((fieldType) => (
            <button
              key={fieldType.type}
              onClick={() => addField(fieldType)}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl mb-2">{fieldType.icon}</span>
              <span className="text-sm font-medium text-gray-700">{fieldType.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Fields */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Form Fields ({formData.fields.length})
        </h3>
        {formData.fields.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No fields added yet. Click on a field type above to add your first field.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.fields.map((field, index) => renderFieldEditor(field, index))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium transition-all duration-300"
        >
          {form ? 'Update Form' : 'Create Form'}
        </button>
      </div>
    </div>
  );
};

export default FormBuilder;
