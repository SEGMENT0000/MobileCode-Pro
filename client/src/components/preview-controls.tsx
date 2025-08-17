import { Monitor, Tablet, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PreviewControlsProps {
  viewportMode: 'desktop' | 'tablet' | 'mobile';
  onViewportChange: (mode: 'desktop' | 'tablet' | 'mobile') => void;
}

export default function PreviewControls({ viewportMode, onViewportChange }: PreviewControlsProps) {
  return (
    <div className="flex items-center space-x-1">
      <Button
        variant="ghost"
        size="sm"
        className={`p-2 ${viewportMode === 'desktop' ? 'text-white' : 'text-text-secondary'} hover:text-white`}
        onClick={() => onViewportChange('desktop')}
        data-testid="button-desktop-view"
      >
        <Monitor className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`p-2 ${viewportMode === 'tablet' ? 'text-white' : 'text-text-secondary'} hover:text-white`}
        onClick={() => onViewportChange('tablet')}
        data-testid="button-tablet-view"
      >
        <Tablet className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`p-2 ${viewportMode === 'mobile' ? 'text-white' : 'text-text-secondary'} hover:text-white`}
        onClick={() => onViewportChange('mobile')}
        data-testid="button-mobile-view"
      >
        <Smartphone className="w-4 h-4" />
      </Button>
    </div>
  );
}
