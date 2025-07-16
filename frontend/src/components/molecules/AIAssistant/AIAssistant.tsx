import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Icon from '../../atoms/Icons/Icon';

const AIAssistant: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    router.push('/ai');
  };

  return (
    <div 
      className="ai-assistant"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="ai-icon">
        <Icon name="robot" size="1.5rem" />
      </div>
      {isHovered && (
        <div className="ai-tooltip">
          Tips of the month
        </div>
      )}
      <style jsx>{`
        .ai-assistant {
          position: fixed;
          top: 2rem;
          right: 2rem;
          z-index: 1000;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .ai-icon {
          background: #1e293b;
          color: white;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(30, 41, 59, 0.3);
          transition: all 0.6s ease;
          animation: pulse 2s infinite;
          border: 3px solid transparent;
          background-clip: padding-box;
        }
        
        .ai-icon:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(30, 41, 59, 0.4);
          background: #334155;
        }
        
        .ai-tooltip {
          background: #1e293b;
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          white-space: nowrap;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          position: relative;
          animation: slideIn 0.5s ease;
        }
        
        .ai-tooltip::before {
          content: '';
          position: absolute;
          top: 50%;
          left: -8px;
          transform: translateY(-50%);
          border: 8px solid transparent;
          border-right-color: #1e293b;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 4px 20px rgba(30, 41, 59, 0.3), 0 0 0 0 rgba(30, 41, 59, 0.4);
          }
          70% {
            box-shadow: 0 4px 20px rgba(30, 41, 59, 0.3), 0 0 0 10px rgba(30, 41, 59, 0);
          }
          100% {
            box-shadow: 0 4px 20px rgba(30, 41, 59, 0.3), 0 0 0 0 rgba(30, 41, 59, 0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        /* Dark mode styles */
        :global(.dark-mode) .ai-icon {
          background: #f8fafc;
          color: #1e293b;
          box-shadow: 0 4px 20px rgba(248, 250, 252, 0.3);
        }
        
        :global(.dark-mode) .ai-icon:hover {
          background: #e2e8f0;
          box-shadow: 0 6px 25px rgba(248, 250, 252, 0.4);
        }
        
        :global(.dark-mode) .ai-tooltip {
          background: #f8fafc;
          color: #1e293b;
        }
        
        :global(.dark-mode) .ai-tooltip::before {
          border-right-color: #f8fafc;
        }
        
        :global(.dark-mode) @keyframes pulse {
          0% {
            box-shadow: 0 4px 20px rgba(248, 250, 252, 0.3), 0 0 0 0 rgba(248, 250, 252, 0.4);
          }
          70% {
            box-shadow: 0 4px 20px rgba(248, 250, 252, 0.3), 0 0 0 10px rgba(248, 250, 252, 0);
          }
          100% {
            box-shadow: 0 4px 20px rgba(248, 250, 252, 0.3), 0 0 0 0 rgba(248, 250, 252, 0);
          }
        }
        
        @media (max-width: 768px) {
          .ai-assistant {
            top: 1rem;
            right: 1rem;
          }
          
          .ai-icon {
            width: 50px;
            height: 50px;
          }
          
          .ai-tooltip {
            font-size: 0.8rem;
            padding: 0.5rem 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AIAssistant;
