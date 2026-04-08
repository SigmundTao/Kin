import { files } from './state.js';
import { openFile } from './tabs.js';

const currentTabEl = document.getElementById('current-tab');

export function openVisualizerTab() {
  currentTabEl.innerHTML = '';
  const panel = renderVisualizerPanel();
  currentTabEl.appendChild(panel);
}

function renderVisualizerPanel() {
  const container = document.createElement('div');
  container.id = 'visualizer-container';
  container.style.cssText = 'width:100%;height:100%;overflow:hidden;position:relative;';

  // Append to DOM first so it has real dimensions
  currentTabEl.appendChild(container);

  // Build clean file list
  const allFiles = [
    { id: 'root', name: 'Ginkgo', parentId: null, type: 'root' },
    ...files.map(f => ({ ...f, name: f.title, parentId: f.parentId ?? 'root' }))
  ];

  let cleanFiles = allFiles;
  let prevLength;
  do {
    prevLength = cleanFiles.length;
    const validIds = new Set(cleanFiles.map(f => f.id));
    cleanFiles = cleanFiles.filter(f => f.parentId === null || validIds.has(f.parentId));
  } while (cleanFiles.length !== prevLength);

  const nodes = cleanFiles.map(f => ({
    id: f.id,
    name: f.type === 'root' ? 'Ginkgo' : f.name,
    type: f.type
  }));

  const links = cleanFiles
    .filter(f => f.parentId !== null)
    .map(f => ({
      source: f.parentId,
      target: f.id
    }));

  const graphData = { nodes, links };

  requestAnimationFrame(() => {
    const w = container.offsetWidth || window.innerWidth;
    const h = container.offsetHeight || window.innerHeight;

    const Graph = ForceGraph3D()(container)
      .width(w)
      .height(h)
      .backgroundColor(getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim() || '#1a1a1a')
      .graphData(graphData)
      .nodeLabel(d => d.name)
      .nodeColor(d => {
        if (d.type === 'root') return '#c9a84c';
        if (d.type === 'folder') return '#888888';
        return '#c9a84c';
      })
      .nodeOpacity(0.9)
      .nodeVal(d => {
        if (d.type === 'root') return 8;
        if (d.type === 'folder') return 5;
        return 3;
      })
      .nodeResolution(16)
      .linkColor(() => 'rgba(150,150,150,0.3)')
      .linkWidth(0.5)
      .linkDirectionalParticles(d => d.target.type === 'note' ? 1 : 0)
      .linkDirectionalParticleSpeed(0.004)
      .linkDirectionalParticleColor(() => '#c9a84c')
      .linkDirectionalParticleWidth(1.5)
      .onNodeClick(d => {
        if (d.type === 'note') openFile(d.id);
      })
      .onNodeHover(node => {
        container.style.cursor = node && node.type === 'note' ? 'pointer' : 'default';
      });

    // HTML label overlay — updates every frame
    const labelContainer = document.createElement('div');
    labelContainer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden;';
    container.appendChild(labelContainer);

    function updateLabels() {
      labelContainer.innerHTML = '';
      nodes.forEach(node => {
        if (node.type === 'root' || !node.x) return;

        // Project 3D coords to 2D screen position
        const pos = Graph.graph2ScreenCoords(node.x, node.y, node.z);
        if (!pos) return;

        const label = document.createElement('div');
        label.textContent = node.name;
        label.style.cssText = `
          position: absolute;
          left: ${pos.x}px;
          top: ${pos.y - 18}px;
          transform: translateX(-50%);
          font-size: 11px;
          white-space: nowrap;
          pointer-events: none;
          color: ${node.type === 'folder' ? 'rgba(200,200,200,0.6)' : 'rgba(201,168,76,0.9)'};
        `;
        labelContainer.appendChild(label);
      });

      requestAnimationFrame(updateLabels);
    }

    updateLabels();

    // Pin root to centre
    const rootNode = nodes.find(n => n.id === 'root');
    if (rootNode) {
      rootNode.fx = 0;
      rootNode.fy = 0;
      rootNode.fz = 0;
    }

    // Handle resize
    window.addEventListener('resize', () => {
      Graph.width(container.offsetWidth).height(container.offsetHeight);
    });
  });

  return container;
}