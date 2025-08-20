import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Package, 
  ShoppingCart, 
  Plus, 
  History, 
  Settings,
  Download,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';

interface WalkthroughStep {
  id: number;
  title: string;
  content: string;
  icon: React.ComponentType<any>;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
  style: 'gradient' | 'minimal' | 'highlight' | 'glass';
}

const walkthroughSteps: WalkthroughStep[] = [
  {
    id: 1,
    title: "Welcome to Quik Shopping! 🛍️",
    content: "Your complete Point of Sale (POS) solution! This powerful app helps you manage products, track sales, and grow your business. Let's explore everything you can do!",
    icon: Package,
    position: 'center',
    style: 'gradient'
  },
  {
    id: 2,
    title: "Navigate Your Store 📱",
    content: "Use the bottom navigation to move around:\n• Products - Browse and manage inventory\n• Cart - Process sales and checkouts\n• Add Product - Create new items quickly\n• History - View all sales and activities\n• Settings - Configure your store",
    icon: ShoppingCart,
    position: 'center',
    style: 'highlight'
  },
  {
    id: 3,
    title: "Manage Products & Sales 💼",
    content: "Complete product management at your fingertips:\n• Add/Edit products with photos and details\n• Set categories and prices\n• Track inventory levels\n• Process sales with cashier confirmation\n• Handle admin controls and security",
    icon: Plus,
    position: 'center',
    style: 'glass'
  },
  {
    id: 4,
    title: "Track Everything 📊",
    content: "Keep detailed records of your business:\n• Sales history with cashier names\n• Product additions/edits\n• Category management activities\n• Admin sign-in/out tracking\n• Activity details and timestamps",
    icon: History,
    position: 'center',
    style: 'minimal'
  },
  {
    id: 5,
    title: "Install & Settings ⚙️",
    content: "Maximize your experience:\n• Install the app from Settings → Install App\n• Configure admin access for security\n• Set cashier dialog preferences\n• Switch between light/dark themes\n• Manage account settings\n\nReady to start selling? 🚀",
    icon: Settings,
    position: 'center',
    style: 'gradient'
  }
];

interface AppWalkthroughProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AppWalkthrough: React.FC<AppWalkthroughProps> = ({ open, onOpenChange }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentStepData = walkthroughSteps[currentStep];

  const handleNext = () => {
    if (currentStep < walkthroughSteps.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsTransitioning(false);
      }, 150);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('walkthrough-completed', 'true');
    onOpenChange(false);
  };

  const handleSkip = () => {
    localStorage.setItem('walkthrough-completed', 'true');
    onOpenChange(false);
  };

  const getPositionClasses = (position: string) => {
    switch (position) {
      case 'top':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom':
        return 'bottom-20 left-1/2 transform -translate-x-1/2';
      case 'left':
        return 'left-4 top-1/2 transform -translate-y-1/2';
      case 'right':
        return 'right-4 top-1/2 transform -translate-y-1/2';
      default:
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
    }
  };

  const getStyleClasses = (style: string) => {
    switch (style) {
      case 'gradient':
        return 'bg-gradient-to-br from-primary/20 via-primary/10 to-background border-primary/30 shadow-elegant';
      case 'highlight':
        return 'bg-card/95 border-2 border-primary shadow-glow backdrop-blur-sm';
      case 'glass':
        return 'bg-card/80 border border-border/50 backdrop-blur-md shadow-lg';
      case 'minimal':
        return 'bg-muted/90 border border-border shadow-md';
      default:
        return 'bg-card border border-border shadow-lg';
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm">
      <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md mx-4 transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <Card className={`${getStyleClasses(currentStepData.style)} transition-all duration-300`}>
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <currentStepData.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{currentStepData.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    Step {currentStep + 1} of {walkthroughSteps.length}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                {currentStepData.content}
              </p>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex space-x-1">
                {walkthroughSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 flex-1 rounded-full transition-smooth ${
                      index <= currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground"
              >
                Skip
              </Button>

              <Button
                size="sm"
                onClick={handleNext}
                className={currentStep === walkthroughSteps.length - 1 ? 'bg-primary hover:bg-primary/90' : ''}
              >
                {currentStep === walkthroughSteps.length - 1 ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Get Started
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppWalkthrough;