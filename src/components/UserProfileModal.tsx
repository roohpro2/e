import React from 'react';
// @ts-ignore
import { UserProfileModal as JSUserProfileModal } from './UserProfileModal.jsx';

export interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = (props) => {
  return <JSUserProfileModal {...props} />;
};

export default UserProfileModal;
