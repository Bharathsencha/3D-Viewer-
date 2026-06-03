const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'shell/src/ViewerWorkspace.jsx');
let content = fs.readFileSync(file, 'utf8');

// Replace the giant useEffect with the properly separated ones
const startIdx = content.indexOf('  useEffect(() => {\n    // Inject CSS to hide O3DViewer header');
const endIdx = content.indexOf('  // Use the file path as the hash URL for the viewer');

if (startIdx !== -1 && endIdx !== -1) {
  const newEffects = `
  // 1. Initialize Iframe UI exactly once
  useEffect(() => {
    let initInterval;
    const initIframe = () => {
      try {
        const doc = iframeRef.current?.contentDocument;
        const win = iframeRef.current?.contentWindow;
        
        if (!win || !win.OV || !win.OV.app) return false;

        if (doc && !doc.getElementById('custom_theme_style')) {
          const style = doc.createElement('style');
          style.id = 'custom_theme_style';
          style.innerHTML = \`
            .title { display: none !important; }
            .ov_bottom_floating_panel { display: none !important; }
            .main_left_container { display: none !important; }
            .intro { display: none !important; }
            html, body, .main, .main_viewer { height: 100% !important; margin: 0 !important; padding: 0 !important; }
            .main { top: 0 !important; }
            div.main_viewer canvas { margin: 0 !important; border: none !important; width: 100% !important; height: 100% !important; }
            .header { background: transparent !important; box-shadow: none !important; position: absolute !important; top: 16px !important; left: 50% !important; transform: translateX(-50%) !important; width: max-content !important; height: auto !important; z-index: 10 !important; border-bottom: none !important; }
            .toolbar { display: flex !important; gap: 4px !important; padding: 6px !important; }
            .ov_toolbar_button { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important; }
            .main_right_container { display: var(--show-settings, none) !important; position: absolute !important; right: 0 !important; top: 0 !important; height: 100% !important; z-index: 100 !important; box-shadow: -8px 0 32px rgba(0,0,0,0.3) !important; background: var(--ov_background_color) !important; border-left: 1px solid var(--ov_border_color) !important; }
            .ov_panel_set_right_container { background: transparent !important; }
            .ov_panel { color: var(--ov_foreground_color) !important; font-family: 'Inter', system-ui, sans-serif !important; }
            .ov_panel_title { font-family: inherit !important; font-weight: 600 !important; color: var(--ov_foreground_color) !important; border-bottom: 1px solid var(--ov_border_color) !important; padding: 16px !important; }
          \`;
          doc.head.appendChild(style);

          const toolbar = doc.getElementById('toolbar');
          if (toolbar && !doc.getElementById('custom_settings_added')) {
            const sep1 = doc.createElement('div');
            sep1.className = 'ov_toolbar_separator';
            toolbar.appendChild(sep1);

            const edgeBtn = doc.createElement('div');
            edgeBtn.id = 'custom_settings_added';
            edgeBtn.className = 'ov_toolbar_button';
            edgeBtn.title = 'Toggle Edges';
            edgeBtn.innerHTML = \`<svg viewBox="0 0 24 24" width="16" height="16" stroke="var(--ov_icon_color)" stroke-width="2" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>\`;
            edgeBtn.style.padding = '8px';
            edgeBtn.style.display = 'flex';
            edgeBtn.style.alignItems = 'center';
            edgeBtn.style.cursor = 'pointer';
            
            edgeBtn.onclick = () => {
              if (win.OV && win.OV.app) {
                 win.OV.app.settings.edgeSettings.showEdges = !win.OV.app.settings.edgeSettings.showEdges;
                 win.OV.app.viewer.SetEdgeSettings(win.OV.app.settings.edgeSettings);
                 win.OV.app.settings.SaveToCookies();
                 if (win.OV.app.settings.edgeSettings.showEdges) edgeBtn.classList.add('selected');
                 else edgeBtn.classList.remove('selected');
              }
            };
            toolbar.appendChild(edgeBtn);
            
            const bgBtn = doc.createElement('div');
            bgBtn.className = 'ov_toolbar_button';
            bgBtn.title = 'Background Color';
            bgBtn.style.padding = '4px 6px';
            bgBtn.style.display = 'flex';
            bgBtn.style.alignItems = 'center';
            bgBtn.innerHTML = \`<input type="color" id="bg_color_picker" style="width: 20px; height: 20px; border: none; padding: 0; background: transparent; cursor: pointer; border-radius: 4px;">\`;
            toolbar.appendChild(bgBtn);
            
            const picker = bgBtn.querySelector('#bg_color_picker');
            if (win.OV && win.OV.app) {
               const c = win.OV.app.settings.backgroundColor;
               if (c && c.r !== undefined) {
                 const toHex = (n) => n.toString(16).padStart(2, '0');
                 picker.value = \`#\${toHex(c.r)}\${toHex(c.g)}\${toHex(c.b)}\`;
               }
            }
            picker.oninput = (e) => {
               const hex = e.target.value;
               const r = parseInt(hex.slice(1,3), 16);
               const g = parseInt(hex.slice(3,5), 16);
               const b = parseInt(hex.slice(5,7), 16);
               if (win.OV && win.OV.app) {
                  win.OV.app.settings.backgroundColor = { r, g, b, a: 255 };
                  win.OV.app.viewer.SetBackgroundColor(win.OV.app.settings.backgroundColor);
                  win.OV.app.settings.SaveToCookies();
               }
            };
          }
        }
        return true;
      } catch (err) {
        return false;
      }
    };

    const handleLoad = () => {
      if (!initIframe()) {
        initInterval = setInterval(() => {
          if (initIframe()) clearInterval(initInterval);
        }, 100);
      }
    };

    if (iframeRef.current) {
      iframeRef.current.addEventListener('load', handleLoad);
      if (iframeRef.current.contentDocument?.readyState === 'complete') {
        handleLoad();
      }
    }

    return () => {
      clearInterval(initInterval);
      if (iframeRef.current) {
        iframeRef.current.removeEventListener('load', handleLoad);
      }
    };
  }, []);

  // 2. Load Model whenever activeFile changes
  useEffect(() => {
    if (!activeFile) return;
    
    let cancelled = false;
    const loadModel = async () => {
      const win = iframeRef.current?.contentWindow;
      if (!win || !win.OV || !win.OV.app) {
        if (!cancelled) setTimeout(loadModel, 100);
        return;
      }
      
      try {
        let siblings = [];
        const findNodeDir = (nodes) => {
          if (nodes.some(n => n.id === activeFile.id)) return nodes.filter(n => n.type === 'file');
          for (const node of nodes) {
            if (node.type === 'folder' && node.children) {
              const res = findNodeDir(node.children);
              if (res) return res;
            }
          }
          return null;
        };
        const allFiles = findNodeDir(library || []) || [activeFile];
        
        // Filter out OTHER 3D models so we don't accidentally load 10 STLs simultaneously
        const isModelExtension = (name) => {
          const ext = name.toLowerCase().split('.').pop();
          return ['stl', 'obj', 'glb', 'gltf', 'step', 'stp', 'igs', 'iges', '3ds', '3dm', '3mf', 'wrl', 'ply', 'fbx', 'dae'].includes(ext);
        };
        
        siblings = allFiles.filter(n => n.id === activeFile.id || !isModelExtension(n.name));
        
        const fileObjects = [];
        for (const node of siblings) {
          const f = await api.getFile(node.path);
          if (f) {
            if (node.id === activeFile.id) fileObjects.unshift(f);
            else fileObjects.push(f);
          }
        }
        
        if (!cancelled && fileObjects.length > 0) {
          win.OV.app.LoadModelFromFileList(fileObjects);
        }
      } catch (e) {
        console.error("Error loading model files:", e);
      }
    };
    
    loadModel();
    return () => { cancelled = true; };
  }, [activeFile, library]);

  // 3. Sync theme dynamically
  useEffect(() => {
    if (!iframeRef.current) return;
    try {
      const isDarkTheme = isDarkMode || themeStyle === 'gta' || themeStyle === 'retro';
      const win = iframeRef.current.contentWindow;
      if (win && win.OV && win.OV.app) {
        win.OV.app.SwitchTheme(isDarkTheme ? 2 : 1, true);
      }
      
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        if (isDarkTheme) doc.body.classList.add('dark-theme');
        else doc.body.classList.remove('dark-theme');
        
        let customStyle = doc.getElementById('dynamic_theme_style');
        if (!customStyle) {
          customStyle = doc.createElement('style');
          customStyle.id = 'dynamic_theme_style';
          doc.head.appendChild(customStyle);
        }
        
        const parentStyle = getComputedStyle(document.documentElement);
        const surface = parentStyle.getPropertyValue('--surface-color').trim() || '#fff';
        const text = parentStyle.getPropertyValue('--text-main').trim() || '#000';
        const border = parentStyle.getPropertyValue('--border-color').trim() || '#ccc';
        const accent = parentStyle.getPropertyValue('--accent-color').trim() || '#3b82f6';
        const bg = parentStyle.getPropertyValue('--bg-color').trim() || '#f0f2f5';

        let toolbarCSS = \`
          body { background-color: \${bg} !important; }
          .main_viewer { background-color: transparent !important; }
          .ov_toolbar_separator { background: \${border} !important; }
        \`;

        if (themeStyle === 'cartoon') {
          toolbarCSS += \`
            .toolbar { background: #ffffff !important; border: 3px solid #000000 !important; border-radius: 20px !important; box-shadow: 6px 6px 0px #000000 !important; }
            .ov_toolbar_button { border-radius: 10px !important; fill: #000000 !important; color: #000000 !important; }
            .ov_toolbar_button:hover, .ov_toolbar_button.selected { background: #ff4081 !important; fill: #fff !important; color: #fff !important; }
            .ov_toolbar svg { stroke: #000000 !important; }
            .ov_toolbar_button:hover svg { stroke: #fff !important; }
            .ov_toolbar_separator { background: #000 !important; width: 3px !important; }
          \`;
        } else if (themeStyle === 'barbie') {
          toolbarCSS += \`
            .toolbar { background: rgba(255, 255, 255, 0.9) !important; border: 3px solid #e91e63 !important; border-radius: 24px !important; box-shadow: 4px 4px 0px rgba(0, 176, 255, 0.5) !important; }
            .ov_toolbar_button { border-radius: 12px !important; fill: #c2185b !important; color: #c2185b !important; }
            .ov_toolbar_button:hover, .ov_toolbar_button.selected { background: #00b0ff !important; fill: #fff !important; color: #fff !important; }
            .ov_toolbar svg { stroke: #c2185b !important; }
            .ov_toolbar_button:hover svg { stroke: #fff !important; }
            .ov_toolbar_separator { background: #e91e63 !important; width: 3px !important; }
          \`;
        } else if (themeStyle === 'gta') {
          if (gtaTheme === 'san_andreas') {
            toolbarCSS += \`
              .toolbar { background: rgba(59, 42, 26, 0.92) !important; border: 2px solid #fca311 !important; border-radius: 4px !important; box-shadow: 0 0 15px rgba(252, 163, 17, 0.4), inset 0 0 10px rgba(0,0,0,0.5) !important; }
              .ov_toolbar_button { border-radius: 2px !important; fill: #ffffff !important; color: #ffffff !important; }
              .ov_toolbar_button:hover, .ov_toolbar_button.selected { background: #fca311 !important; fill: #000 !important; color: #000 !important; box-shadow: 0 0 8px #fca311 !important; }
              .ov_toolbar svg { stroke: #ffffff !important; }
              .ov_toolbar_button:hover svg { stroke: #000 !important; }
              .ov_toolbar_separator { background: #fca311 !important; box-shadow: 0 0 4px rgba(252, 163, 17, 0.5) !important; }
            \`;
          } else if (gtaTheme === 'gta4') {
            toolbarCSS += \`
              .toolbar { background: rgba(26, 26, 26, 0.92) !important; border: 1px solid #8c7355 !important; border-radius: 2px !important; box-shadow: 0 4px 20px rgba(0,0,0,0.6) !important; }
              .ov_toolbar_button { border-radius: 2px !important; fill: #c0c0c0 !important; color: #c0c0c0 !important; }
              .ov_toolbar_button:hover, .ov_toolbar_button.selected { background: #8c7355 !important; fill: #fff !important; color: #fff !important; }
              .ov_toolbar svg { stroke: #c0c0c0 !important; }
              .ov_toolbar_button:hover svg { stroke: #fff !important; }
              .ov_toolbar_separator { background: #5a4a3a !important; }
            \`;
          } else if (gtaTheme === 'gta5') {
            toolbarCSS += \`
              .toolbar { background: rgba(0, 30, 20, 0.92) !important; border: 2px solid #55a630 !important; border-radius: 4px !important; box-shadow: 0 0 20px rgba(85, 166, 48, 0.4), inset 0 0 10px rgba(0,0,0,0.5) !important; }
              .ov_toolbar_button { border-radius: 2px !important; fill: #ffffff !important; color: #ffffff !important; }
              .ov_toolbar_button:hover, .ov_toolbar_button.selected { background: #55a630 !important; fill: #fff !important; color: #fff !important; box-shadow: 0 0 8px #55a630 !important; }
              .ov_toolbar svg { stroke: #ffffff !important; }
              .ov_toolbar_button:hover svg { stroke: #fff !important; }
              .ov_toolbar_separator { background: #55a630 !important; box-shadow: 0 0 4px rgba(85, 166, 48, 0.5) !important; }
            \`;
          } else {
            toolbarCSS += \`
              .toolbar { background: rgba(13, 1, 33, 0.92) !important; border: 2px solid #ff00a0 !important; border-radius: 4px !important; box-shadow: 0 0 20px rgba(255, 0, 160, 0.5), inset 0 0 10px rgba(0,0,0,0.5) !important; }
              .ov_toolbar_button { border-radius: 2px !important; fill: #00ffff !important; color: #00ffff !important; }
              .ov_toolbar_button:hover, .ov_toolbar_button.selected { background: #ff00a0 !important; fill: #fff !important; color: #fff !important; box-shadow: 0 0 8px #ff00a0 !important; }
              .ov_toolbar svg { stroke: #00ffff !important; }
              .ov_toolbar_button:hover svg { stroke: #fff !important; }
              .ov_toolbar_separator { background: #ff00a0 !important; box-shadow: 0 0 4px rgba(255, 0, 160, 0.5) !important; }
            \`;
          }
        } else if (themeStyle === 'ghibli') {
          toolbarCSS += \`
            .toolbar { background: rgba(255, 255, 255, 0.85) !important; border: 2px solid \${border} !important; border-radius: 24px !important; box-shadow: 4px 4px 0px \${border} !important; }
            .ov_toolbar_button { border-radius: 16px !important; fill: \${text} !important; color: \${text} !important; }
            .ov_toolbar_button:hover, .ov_toolbar_button.selected { background: \${accent} !important; fill: #fff !important; color: #fff !important; }
            .ov_toolbar svg { stroke: \${text} !important; }
            .ov_toolbar_button:hover svg { stroke: #fff !important; }
            .ov_toolbar_separator { background: \${border} !important; }
          \`;
        } else if (themeStyle === 'retro') {
          toolbarCSS += \`
            .toolbar { background: rgba(30, 8, 48, 0.9) !important; border: 2px solid #ff00ff !important; border-radius: 8px !important; box-shadow: 0 0 20px rgba(255, 0, 255, 0.6), 0 0 40px rgba(255, 0, 255, 0.3) !important; }
            .ov_toolbar_button { border-radius: 6px !important; fill: #00ffff !important; color: #00ffff !important; }
            .ov_toolbar_button:hover, .ov_toolbar_button.selected { background: #ff00a0 !important; fill: #fff !important; color: #fff !important; box-shadow: 0 0 10px #ff00a0 !important; }
            .ov_toolbar svg { stroke: #00ffff !important; }
            .ov_toolbar_button:hover svg { stroke: #fff !important; }
            .ov_toolbar_separator { background: #ff00ff !important; box-shadow: 0 0 4px #ff00ff !important; }
          \`;
        } else if (themeStyle === '95') {
          toolbarCSS += \`
            .toolbar { background: #c0c0c0 !important; border: 1px solid #000000 !important; border-radius: 0px !important; box-shadow: inset 1px 1px 0px #ffffff, inset -1px -1px 0px #000000, inset 2px 2px 0px #dfdfdf, inset -2px -2px 0px #808080 !important; }
            .ov_toolbar_button { border-radius: 0px !important; fill: #000000 !important; color: #000000 !important; }
            .ov_toolbar_button:hover, .ov_toolbar_button.selected { background: #000080 !important; fill: #fff !important; color: #fff !important; box-shadow: inset 1px 1px 0px #000000, inset -1px -1px 0px #ffffff !important; }
            .ov_toolbar svg { stroke: #000000 !important; }
            .ov_toolbar_button:hover svg { stroke: #fff !important; }
            .ov_toolbar_separator { background: #808080 !important; }
          \`;
        } else {
          const isDk = isDarkMode;
          toolbarCSS += \`
            .toolbar { background: \${isDk ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)'} !important; border: 1px solid \${isDk ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} !important; border-radius: 16px !important; box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15) !important; }
            .ov_toolbar_button { border-radius: 10px !important; fill: \${text} !important; color: \${text} !important; }
            .ov_toolbar_button:hover, .ov_toolbar_button.selected { background: \${accent} !important; fill: #fff !important; color: #fff !important; }
            .ov_toolbar svg { stroke: \${text} !important; }
            .ov_toolbar_button:hover svg { stroke: #fff !important; }
          \`;
        }

        customStyle.innerHTML = toolbarCSS;
      }
    } catch (err) {}
  }, [isDarkMode, themeStyle, gtaTheme]);
`;
  content = content.slice(0, startIdx) + newEffects + content.slice(endIdx);
  fs.writeFileSync(file, content);
  console.log('Successfully patched ViewerWorkspace.jsx');
} else {
  console.error('Could not find injection markers');
}
