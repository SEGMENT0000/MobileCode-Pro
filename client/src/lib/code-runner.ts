export class CodeRunner {
  static generatePreview(html: string, css: string, js: string): string {
    // Create a self-contained HTML document
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebPreview Pro - Live Preview</title>
    <style>
      /* Reset and base styles */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
      }

      /* User's custom CSS */
      ${css}
    </style>
</head>
<body>
    ${this.extractBodyContent(html)}
    <script>
      (function() {
        // Override console methods to capture output
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        // Track sent messages to prevent duplicates
        const sentMessages = new Set();

        // Function to send console messages to parent window
        function sendToParent(level, message) {
          try {
            if (window.parent && window.parent !== window) {
              // Create a unique key for this message to prevent duplicates
              const messageKey = \`\${level}:\${message}\`;
              
              if (!sentMessages.has(messageKey)) {
                sentMessages.add(messageKey);
                
                window.parent.postMessage({
                  type: 'console-log',
                  level: level,
                  message: String(message)
                }, '*');
              }
            }
          } catch (e) {
            // Ignore cross-origin errors
          }
        }

        // Override console methods
        console.log = function(...args) {
          const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ');
          sendToParent('log', message);
          originalLog.apply(console, args);
        };

        console.error = function(...args) {
          const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ');
          sendToParent('error', message);
          originalError.apply(console, args);
        };

        console.warn = function(...args) {
          const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ');
          sendToParent('warn', message);
          originalWarn.apply(console, args);
        };

        // Error handling wrapper
        window.onerror = function(msg, url, lineNo, columnNo, error) {
          sendToParent('error', \`Script Error: \${msg} at line \${lineNo}\`);
          return false;
        };

        window.addEventListener('unhandledrejection', function(event) {
          sendToParent('error', \`Unhandled Promise Rejection: \${event.reason}\`);
        });

        // Execute user JavaScript
        try {
          ${js}
        } catch (error) {
          sendToParent('error', \`JavaScript execution error: \${error.message}\`);
        }
      })();
    </script>
</body>
</html>`;

    return fullHtml;
  }

  private static extractBodyContent(html: string): string {
    // Extract content between body tags, or use the whole content if no body tags
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      return bodyMatch[1];
    }

    // If no body tags, check if it's a full HTML document
    if (html.includes('<html') || html.includes('<!DOCTYPE')) {
      // It's a full HTML document, extract everything after head
      const headEndMatch = html.match(/<\/head>/i);
      if (headEndMatch) {
        const afterHead = html.substring(headEndMatch.index! + headEndMatch[0].length);
        return afterHead.replace(/<\/?html[^>]*>/gi, '').replace(/<\/?body[^>]*>/gi, '').trim();
      }
    }

    // Otherwise, assume it's just body content
    return html;
  }

  static createBlobUrl(html: string): string {
    const blob = new Blob([html], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }

  static downloadPreview(html: string, filename = 'preview.html'): void {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  }
}