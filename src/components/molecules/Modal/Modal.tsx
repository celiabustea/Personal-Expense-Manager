import React from 'react';
import Button from '../../atoms/Button';
import Heading from '../../atoms/Headings';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <Heading level={2}>{title}</Heading>
        {children}
      </div>
    </div>
  );
};

export default Modal;
