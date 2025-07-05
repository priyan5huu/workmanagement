import React, { useState, useEffect } from 'react';
import { UserRole, User } from '../../types';
import { canUserManageRole, getRolePermissions } from '../../utils/rolePermissions';
import userManagementService from '../../services/userManagement';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { showToast } from '../common/Toast';

interface UserCreationFormProps {
  onUserCreated?: (user: User) => void;
  onCancel?: () => void;
}

interface FormData {
  name: string;
  email: string;
  role: UserRole;
  department: string;
  managerId: string;
  phoneNumber: string;
  timezone: string;
}

const TIMEZONE_OPTIONS = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney'
];

const DEPARTMENT_OPTIONS = [
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations'
];

export const UserCreationForm: React.FC<UserCreationFormProps> = ({
  onUserCreated,
  onCancel
}) => {
  const { state } = useAuth();
  const currentUser = state.user;
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    role: UserRole.EMPLOYEE,
    department: currentUser?.department || '',
    managerId: '',
    phoneNumber: '',
    timezone: 'UTC'
  });
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableManagers, setAvailableManagers] = useState<User[]>([]);

  useEffect(() => {
    if (currentUser) {
      // Determine which roles the current user can create
      const roles = Object.values(UserRole).filter(role => 
        canUserManageRole(currentUser.role, role)
      );
      setAvailableRoles(roles);

      // Load available managers
      loadAvailableManagers();
    }
  }, [currentUser]);

  const loadAvailableManagers = async () => {
    if (!currentUser) return;

    try {
      const managers = await userManagementService.getManagedUsers(currentUser.id);
      const potentialManagers = managers.filter(manager => 
        canUserManageRole(manager.role, formData.role)
      );
      setAvailableManagers([currentUser, ...potentialManagers]);
    } catch (error) {
      console.error('Failed to load managers:', error);
    }
  };

  useEffect(() => {
    loadAvailableManagers();
  }, [formData.role]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Validation
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast.error('Name and email are required');
      return;
    }

    if (!formData.email.includes('@')) {
      showToast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const newUser = await userManagementService.createUser({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        department: formData.department,
        managerId: formData.managerId || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        timezone: formData.timezone
      }, currentUser);

      showToast.success('User created successfully');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        role: UserRole.EMPLOYEE,
        department: currentUser.department,
        managerId: '',
        phoneNumber: '',
        timezone: 'UTC'
      });

      if (onUserCreated) {
        onUserCreated(newUser as User);
      }
    } catch (error: any) {
      showToast.error(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const getRoleDescription = (role: UserRole) => {
    const permissions = getRolePermissions(role);
    return permissions.description;
  };

  if (!currentUser) {
    return <div>Please log in to create users.</div>;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Create New User
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter email address"
              />
            </div>
          </div>

          {/* Role and Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {availableRoles.map(role => (
                  <option key={role} value={role}>
                    {role.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              {formData.role && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {getRoleDescription(formData.role)}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Department *
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {DEPARTMENT_OPTIONS.map(dept => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Manager and Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="managerId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Manager
              </label>
              <select
                id="managerId"
                name="managerId"
                value={formData.managerId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select a manager (optional)</option>
                {availableManagers.map(manager => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name} ({manager.role.replace(/_/g, ' ')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timezone
            </label>
            <select
              id="timezone"
              name="timezone"
              value={formData.timezone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {TIMEZONE_OPTIONS.map(tz => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          {/* Role Capabilities Preview */}
          {formData.role && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                Role Capabilities:
              </h4>
              <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                {getRolePermissions(formData.role).capabilities.map((capability, index) => (
                  <li key={index}>• {capability}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            {onCancel && (
              <Button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default UserCreationForm;
