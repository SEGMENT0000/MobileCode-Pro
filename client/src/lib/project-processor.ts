export interface ProjectFile {
  name: string;
  path: string;
  content: string;
  type: string;
  size: number;
}

export class ProjectProcessor {
  private files: Map<string, ProjectFile>;

  constructor(files: Map<string, ProjectFile>) {
    this.files = files;
  }

  async processProject(): Promise<string> {
    // Find main HTML file
    const htmlFile = this.findMainHtmlFile();
    if (!htmlFile) {
      throw new Error('No HTML file found in project. Please include an index.html or any .html file.');
    }

    let html = htmlFile.content;

    // Process CSS links
    html = await this.processCssLinks(html);

    // Process script tags
    html = await this.processScriptTags(html);

    // Process image sources and other assets
    html = await this.processAssets(html);

    // Process CSS background images and font faces
    html = await this.processCssAssets(html);

    // Add security headers
    html = this.addSecurityHeaders(html);

    return html;
  }

  private findMainHtmlFile(): ProjectFile | null {
    // Look for index.html first
    for (const [path, file] of Array.from(this.files.entries())) {
      if (file.name === 'index.html') {
        return file;
      }
    }

    // Then look for any .html file
    for (const [path, file] of Array.from(this.files.entries())) {
      if (file.name.endsWith('.html')) {
        return file;
      }
    }

    return null;
  }

  private async processCssLinks(html: string): Promise<string> {
    const linkRegex = /<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi;

    return html.replace(linkRegex, (match, href) => {
      const cssFile = this.resolveFilePath(href);
      if (cssFile) {
        // Process CSS for nested assets
        const processedCss = this.processCssContent(cssFile.content);
        return `<style>\n${processedCss}\n</style>`;
      }
      return `<!-- Missing CSS file: ${href} -->`;
    });
  }

  private async processScriptTags(html: string): Promise<string> {
    const scriptRegex = /<script[^>]+src=["']([^"']+\.js)["'][^>]*><\/script>/gi;

    return html.replace(scriptRegex, (match, src) => {
      const jsFile = this.resolveFilePath(src);
      if (jsFile) {
        // Process JS for ES modules and imports
        const processedJs = this.processJsContent(jsFile.content);
        return `<script>\n${processedJs}\n</script>`;
      }
      return `<!-- Missing JS file: ${src} -->`;
    });
  }

  private async processAssets(html: string): Promise<string> {
    // Process img src attributes
    const imgRegex = /<img([^>]*)\ssrc=["']([^"']+)["']([^>]*)>/gi;

    html = html.replace(imgRegex, (match, beforeSrc, src, afterSrc) => {
      const assetFile = this.resolveFilePath(src);
      if (assetFile && assetFile.content.startsWith('data:')) {
        return `<img${beforeSrc} src="${assetFile.content}"${afterSrc}>`;
      }
      return match;
    });

    // Process link href for icons and other assets
    const linkAssetRegex = /<link([^>]*)\shref=["']([^"']+\.(ico|png|jpg|jpeg|svg))["']([^>]*)>/gi;

    html = html.replace(linkAssetRegex, (match, beforeHref, href, ext, afterHref) => {
      const assetFile = this.resolveFilePath(href);
      if (assetFile && assetFile.content.startsWith('data:')) {
        return `<link${beforeHref} href="${assetFile.content}"${afterHref}>`;
      }
      return match;
    });

    return html;
  }

  private processCssContent(css: string): string {
    // Process url() references in CSS
    const urlRegex = /url\(['"]?([^'")\s]+)['"]?\)/gi;

    return css.replace(urlRegex, (match, url) => {
      // Skip data URLs and external URLs
      if (url.startsWith('data:') || url.startsWith('http')) {
        return match;
      }

      const assetFile = this.resolveFilePath(url);
      if (assetFile && assetFile.content.startsWith('data:')) {
        return `url('${assetFile.content}')`;
      }
      return match;
    });
  }

  private async processCssAssets(html: string): Promise<string> {
    // Find and process inline CSS
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;

    return html.replace(styleRegex, (match, cssContent) => {
      const processedCss = this.processCssContent(cssContent);
      return match.replace(cssContent, processedCss);
    });
  }

  private processJsContent(js: string): string {
    // Simple ES module processing - in production this would be much more sophisticated
    // Handle basic import/export statements
    let processedJs = js;

    // Process import statements
    const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/gi;
    const imports = new Set<string>();

    processedJs = processedJs.replace(importRegex, (match, modulePath) => {
      const moduleFile = this.resolveFilePath(modulePath);
      if (moduleFile) {
        imports.add(moduleFile.content);
        return `// Bundled: ${modulePath}`;
      }
      return `// Missing module: ${modulePath}`;
    });

    // Prepend bundled modules
    if (imports.size > 0) {
      const bundledContent = Array.from(imports).join('\n\n');
      processedJs = `${bundledContent}\n\n${processedJs}`;
    }

    return processedJs;
  }

  private resolveFilePath(path: string): ProjectFile | null {
    // Remove query parameters and fragments
    const cleanPath = path.split('?')[0].split('#')[0];

    // Try exact match first
    if (this.files.has(cleanPath)) {
      return this.files.get(cleanPath)!;
    }

    // Try without leading ./
    if (cleanPath.startsWith('./')) {
      const withoutDot = cleanPath.substring(2);
      if (this.files.has(withoutDot)) {
        return this.files.get(withoutDot)!;
      }
    }

    // Try without leading /
    if (cleanPath.startsWith('/')) {
      const withoutSlash = cleanPath.substring(1);
      if (this.files.has(withoutSlash)) {
        return this.files.get(withoutSlash)!;
      }
    }

    // Try to find by filename
    for (const [filePath, file] of Array.from(this.files.entries())) {
      if (filePath.endsWith(cleanPath) || file.name === cleanPath) {
        return file;
      }
    }

    // Try relative path resolution (basic)
    for (const [filePath, file] of Array.from(this.files.entries())) {
      const parts = cleanPath.split('/');
      const fileName = parts[parts.length - 1];
      if (file.name === fileName) {
        return file;
      }
    }

    return null;
  }

  private addSecurityHeaders(html: string): string {
    // More permissive CSP to avoid CORS issues while maintaining security
    const cspMeta = `<meta http-equiv="Content-Security-Policy" content="default-src 'self' data: blob:; script-src 'unsafe-inline' 'unsafe-eval' data: blob:; style-src 'unsafe-inline' data: blob: https:; img-src 'self' data: blob: https:; font-src 'self' data: blob: https:; connect-src 'self' data: blob:;">`;

    // Add to existing head or create one
    if (html.includes('<head>')) {
      return html.replace('<head>', `<head>\n    ${cspMeta}`);
    } else if (html.includes('<!DOCTYPE html>')) {
      return html.replace('<!DOCTYPE html>', `<!DOCTYPE html>\n<html><head>\n    ${cspMeta}\n</head><body>`) + '</body></html>';
    } else {
      return `<!DOCTYPE html>\n<html>\n<head>\n    ${cspMeta}\n</head>\n<body>\n${html}\n</body>\n</html>`;
    }
  }
}
