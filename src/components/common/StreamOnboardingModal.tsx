import React from 'react';
import { StreamType } from '../../types';
import { StudentOnboardingModal } from './StudentOnboardingModal';

interface StreamOnboardingModalProps {
  isOpen: boolean;
  onSelectStream?: (stream: StreamType) => void;
  defaultStream?: StreamType;
}

export const StreamOnboardingModal: React.FC<StreamOnboardingModalProps> = ({
  isOpen,
  defaultStream = 'sciences_experimentales',
}) => {
  return (
    <StudentOnboardingModal
      isOpen={isOpen}
      defaultStream={defaultStream}
    />
  );
};

