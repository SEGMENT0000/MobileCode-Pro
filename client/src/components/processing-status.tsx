import { Settings } from "lucide-react";

export default function ProcessingStatus() {
  return (
    <div className="glassmorphic rounded-xl p-6" data-testid="processing-status">
      <div className="flex items-center space-x-3">
        <div className="loading-spinner">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium">Processing Project</p>
          <p className="text-sm text-text-secondary">Resolving paths and bundling assets...</p>
        </div>
      </div>
    </div>
  );
}
