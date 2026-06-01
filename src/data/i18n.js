// UI string dictionary · ES (default) + EN.
//
// Domain content (stories.js narratives, scenarios.js titles/problems/outcomes,
// components.js descriptions, mindmaps.js labels, componentDetails.js caveats)
// stays in Spanish — translating those would multiply maintenance cost without
// matching ROI. UI chrome (buttons, headers, tooltips, placeholders) is what
// flips with the locale toggle.

export const STRINGS = {
  // ── Tabs ────────────────────────────────────────────────────────────────
  'tab.story':     { es: 'Story',     en: 'Story' },
  'tab.scenario':  { es: 'Scenario',  en: 'Scenario' },
  'tab.grid':      { es: 'Grid',      en: 'Grid' },
  'tab.graph':     { es: 'Graph',     en: 'Graph' },
  'tab.mindmap':   { es: 'Mindmap',   en: 'Mindmap' },

  // ── Toolbar buttons ─────────────────────────────────────────────────────
  'toolbar.search.placeholder':  { es: 'Buscar componentes…',                en: 'Search components…' },
  'toolbar.reset.view':          { es: 'Reset view',                         en: 'Reset view' },
  'toolbar.reset.view.title':    { es: 'Restablecer vista',                  en: 'Reset view' },
  'toolbar.theme.toLight':       { es: 'Cambiar a tema claro',               en: 'Switch to light theme' },
  'toolbar.theme.toDark':        { es: 'Cambiar a tema oscuro',              en: 'Switch to dark theme' },
  'toolbar.locale.title':        { es: 'Cambiar idioma',                     en: 'Change language' },
  'toolbar.blast.on':            { es: 'Desactivar Blast Radius (Esc)',      en: 'Deactivate Blast Radius (Esc)' },
  'toolbar.blast.off':           { es: 'Activar Blast Radius',               en: 'Activate Blast Radius' },
  'toolbar.blast.label':         { es: 'Blast Radius',                       en: 'Blast Radius' },
  'toolbar.compare.on':          { es: 'Salir de Compare (Esc)',             en: 'Exit Compare (Esc)' },
  'toolbar.compare.off':         { es: 'Activar Compare — click 2 componentes para comparar', en: 'Activate Compare — click 2 components to compare' },
  'toolbar.compare.label':       { es: 'Compare',                            en: 'Compare' },
  'toolbar.cost.on':             { es: 'Ocultar Costo aproximado',           en: 'Hide approximate cost' },
  'toolbar.cost.off':            { es: 'Mostrar Costo aproximado · precios públicos de Microsoft', en: 'Show approximate cost · Microsoft public pricing' },
  'toolbar.cost.label':          { es: 'Costo',                              en: 'Cost' },
  'toolbar.edges.label':         { es: 'Edges',                              en: 'Edges' },
  'toolbar.overlay.label':       { es: 'Overlay',                            en: 'Overlay' },
  'toolbar.overlay.none':        { es: 'None',                               en: 'None' },
  'toolbar.overlay.deployment':  { es: 'Deployment',                         en: 'Deployment' },
  'toolbar.overlay.heatmap':     { es: 'Heatmap',                            en: 'Heatmap' },

  // ── Scenario · canvas chrome ────────────────────────────────────────────
  'scenario.load.placeholder':   { es: 'Cargar escenario…',                  en: 'Load scenario…' },
  'scenario.stats.components':   { es: 'Components',                         en: 'Components' },
  'scenario.stats.edges':        { es: 'Edges',                              en: 'Edges' },
  'scenario.stats.of':           { es: 'of {n} total',                       en: 'of {n} total' },
  'scenario.action.arrange':     { es: '⇆ Arrange',                          en: '⇆ Arrange' },
  'scenario.action.arrange.title': { es: 'Auto-arrange nodes en layout horizontal', en: 'Auto-arrange nodes in horizontal layout' },
  'scenario.action.export':      { es: '↓ Export PNG',                       en: '↓ Export PNG' },
  'scenario.action.export.title': { es: 'Exportar canvas como PNG',          en: 'Export canvas as PNG' },
  'scenario.action.exportVideo': { es: '🎬 Export MP4',                      en: '🎬 Export MP4' },
  'scenario.action.exportVideo.title': { es: 'Grabar 4 s del flujo como MP4/WebM', en: 'Record a 4 s loop of the flow as MP4/WebM' },
  'scenario.action.exportVideo.recording': { es: '● Grabando…',              en: '● Recording…' },
  'scenario.action.clear':       { es: '↻ Clear',                            en: '↻ Clear' },
  'scenario.action.clear.title.empty': { es: 'Canvas ya está vacío',         en: 'Canvas already empty' },
  'scenario.action.clear.title':       { es: 'Vaciar canvas',                en: 'Clear canvas' },
  'scenario.flow.label':         { es: 'Flow',                               en: 'Flow' },
  'scenario.flow.slow':          { es: 'Slow',                               en: 'Slow' },
  'scenario.flow.normal':        { es: 'Normal',                             en: 'Normal' },
  'scenario.flow.fast':          { es: 'Fast',                               en: 'Fast' },
  'scenario.add.title':          { es: 'Sugerir neighbors conectados desde el catálogo', en: 'Suggest connected neighbors from catalog' },
  'scenario.canvas.clear':       { es: 'Vaciar canvas',                       en: 'Clear canvas' },
  'scenario.empty.line1':        { es: 'Arrastra componentes desde la librería', en: 'Drag components from the library' },
  'scenario.empty.line2':        { es: 'para construir tu escenario',          en: 'to build your scenario' },
  'scenario.connectWith':        { es: 'CONECTAR CON…',                        en: 'CONNECT WITH…' },
  'scenario.noNeighbors':        { es: 'No quedan vecinos del catálogo',       en: 'No catalog neighbors left' },
  'scenario.connectionType':     { es: 'TIPO DE CONEXIÓN',                     en: 'CONNECTION TYPE' },
  'scenario.edgeLabel.placeholder': { es: 'Etiqueta (opcional)',              en: 'Label (optional)' },
  'scenario.connectHint':        { es: 'Arrastra desde · para conectar · Click derecho elimina', en: 'Drag from · to connect · Right-click deletes' },
  'scenario.edge.hide':          { es: 'Ocultar {k}',                         en: 'Hide {k}' },
  'scenario.edge.show':          { es: 'Mostrar {k}',                         en: 'Show {k}' },

  // ── Scenario · empty hero ───────────────────────────────────────────────
  'scenario.hero.eyebrow':       { es: 'SCENARIO BUILDER',                   en: 'SCENARIO BUILDER' },
  'scenario.hero.title':         { es: 'Compón tu propio escenario',         en: 'Compose your own scenario' },
  'scenario.hero.body':          {
    es: 'Arrastra componentes desde la librería de la izquierda al canvas. Conéctalos arrastrando desde el puerto ● de cada nodo. Define título · problema · resultado · frameworks en el panel derecho. Click Compartir al final para copiar el link con tu composición.',
    en: 'Drag components from the library on the left to the canvas. Connect them by dragging from the ● port of each node. Define title · problem · outcome · frameworks in the right panel. Click Share at the end to copy the link with your composition.'
  },
  'scenario.hero.chip.components': { es: '📦 42 componentes',                en: '📦 42 components' },
  'scenario.hero.chip.edges':      { es: '🔗 4 tipos de edge',                en: '🔗 4 edge types' },
  'scenario.hero.chip.mitre':      { es: '🛡 MITRE TTPs',                     en: '🛡 MITRE TTPs' },
  'scenario.hero.chip.frameworks': { es: '📜 7 categorías',    en: '📜 7 categories' },

  // ── DetailPanel · workspace header ──────────────────────────────────────
  'panel.workspace':             { es: 'Workspace',                          en: 'Workspace' },
  'panel.share':                 { es: 'Compartir',                          en: 'Share' },
  'panel.export':                { es: '↓ Exportar',                         en: '↓ Export' },
  'panel.copied':                { es: 'Copiado',                            en: 'Copied' },
  'panel.scenario.details':      { es: 'Detalles del escenario',             en: 'Scenario details' },
  'panel.scenario.fields':       { es: '{filled}/3 campos',                  en: '{filled}/3 fields' },
  'panel.scenario.frameworksShort': { es: '{n} fw',                          en: '{n} fw' },
  'panel.scenario.title.label':       { es: 'Título',                        en: 'Title' },
  'panel.scenario.title.placeholder': { es: 'ej. Flujo de clasificación de datos', en: 'e.g. Data classification flow' },
  'panel.scenario.problem.label':     { es: 'Problema',                      en: 'Problem' },
  'panel.scenario.problem.placeholder': { es: '¿Qué problema resuelve este escenario?', en: 'What problem does this scenario solve?' },
  'panel.scenario.outcome.label':     { es: 'Resultado esperado',            en: 'Expected outcome' },
  'panel.scenario.outcome.placeholder': { es: '¿Cuál es el outcome deseado?', en: 'What is the desired outcome?' },
  'panel.frameworks.label':      { es: 'Framework coverage',                 en: 'Framework coverage' },
  'panel.frameworks.selected':   { es: '{n} seleccionados',                  en: '{n} selected' },
  'panel.composition':           { es: 'Tu composición',                     en: 'Your composition' },
  'panel.composition.empty':     { es: '· canvas vacío · arrastra componentes', en: '· empty canvas · drag components' },
  'panel.composition.label':     { es: 'Composición',                         en: 'Composition' },
  'panel.composition.intro':     {
    es: 'Arrastra componentes desde la librería y conéctalos arrastrando desde el puerto de cada nodo.',
    en: 'Drag components from the library and connect them by dragging from the port of each node.'
  },
  'panel.composition.components': { es: 'componentes',                       en: 'components' },
  'panel.composition.edges':      { es: 'conexiones',                        en: 'connections' },
  'panel.animate':               { es: '▶ Animar flujo',                     en: '▶ Animate flow' },
  'panel.stop':                  { es: '■ Detener flujo',                    en: '■ Stop flow' },
  'panel.clear':                 { es: '↻ Vaciar',                           en: '↻ Clear' },
  'panel.mitre.label':           { es: 'MITRE ATT&CK',                       en: 'MITRE ATT&CK' },
  'panel.mitre.count':           { es: '{n} técnicas',                       en: '{n} techniques' },
  'panel.mitre.hint':            { es: 'Click en cualquier técnica para abrir la página oficial de MITRE ATT&CK.', en: 'Click on any technique to open the official MITRE ATT&CK page.' },

  // ── DetailPanel · component profile ─────────────────────────────────────
  'profile.close':               { es: '× cerrar',                           en: '× close' },
  'profile.subcomponents':       { es: 'Sub-components',                     en: 'Sub-components' },
  'profile.related':             { es: 'Related',                            en: 'Related' },
  'profile.caveats':             { es: 'Caveats',                            en: 'Caveats' },
  'profile.effort':              { es: 'Esfuerzo',                           en: 'Effort' },
  'profile.effort.low':          { es: 'Low',                                en: 'Low' },
  'profile.effort.medium':       { es: 'Medium',                             en: 'Medium' },
  'profile.effort.high':         { es: 'High',                               en: 'High' },
  'profile.multiTenant':         { es: 'Multi-Tenant',                       en: 'Multi-Tenant' },
  'profile.multiTenant.yes':     { es: 'sí',                                 en: 'yes' },
  'profile.multiTenant.no':      { es: 'no',                                 en: 'no' },
  'profile.link.learn':          { es: 'Microsoft Learn',                    en: 'Microsoft Learn' },
  'profile.link.license':        { es: 'Licencia',                           en: 'License' },
  'profile.link.rbac':           { es: 'RBAC',                               en: 'RBAC' },
  'profile.connections.degree':  { es: 'Grado',                              en: 'Degree' },
  'profile.connections.io':      { es: 'I/O',                                en: 'I/O' },
  'profile.connections.total':   { es: 'conexiones totales',                 en: 'total connections' },
  'profile.connections.outIn':   { es: 'salida · entrada',                   en: 'out · in' },
  'profile.out':                 { es: 'Salida',                             en: 'Out' },
  'profile.in':                  { es: 'Entrada',                            en: 'In' },
  'profile.connectionsInScenario': { es: 'Conexiones en este escenario',     en: 'Connections in this scenario' },
  'profile.noConnections':       { es: 'No tiene conexiones. Arrastra desde el puerto para conectarlo.', en: 'No connections. Drag from the port to connect it.' },
  'profile.suggestedNeighbors':  { es: 'Vecinos en catálogo · sugeridos',    en: 'Catalog neighbors · suggested' },
  'profile.add':                 { es: '+ añadir',                           en: '+ add' },
  'profile.phase':               { es: 'Fase',                               en: 'Phase' },
  'profile.coverage':            { es: 'Cobertura',                          en: 'Coverage' },

  // ── Story view ──────────────────────────────────────────────────────────
  'story.prev':                  { es: '← Anterior',                         en: '← Previous' },
  'story.next':                  { es: 'Siguiente →',                        en: 'Next →' },
  'story.restart':               { es: '↻ Reiniciar historia',               en: '↻ Restart story' },
  'story.scene':                 { es: 'Escena {idx} / {total}',             en: 'Scene {idx} / {total}' },
  'story.shortcuts':             { es: 'play/pausa · ← → escena',            en: 'play/pause · ← → scene' },
  'story.navigate':              { es: 'navegar',                            en: 'navigate' },
  'story.shortcut.space':        { es: 'Espacio',                            en: 'Space' },
  'story.insight.header':        { es: 'Por qué importa',                    en: 'Why it matters' },
  'story.newInScene':            { es: 'Nuevo en esta escena',               en: 'New in this scene' },
  'story.noChanges':             { es: '— sin cambios estructurales —',      en: '— no structural changes —' },
  'story.pace.calm':             { es: 'Calm',                               en: 'Calm' },
  'story.pace.demo':             { es: 'Demo',                               en: 'Demo' },
  'story.pace.fast':             { es: 'Fast',                               en: 'Fast' },
  'story.picker.eyebrow':        { es: 'HISTORIA',                           en: 'STORY' },
  'story.picker.title':          { es: 'Cambiar historia',                   en: 'Switch story' },
  'story.picker.available':      { es: '{n} disponibles',                    en: '{n} available' },
  'story.picker.filter':         { es: 'Filtrar por título o tema…',         en: 'Filter by title or topic…' },
  'story.picker.noMatch':        { es: 'Sin coincidencias para "{q}"',       en: 'No matches for "{q}"' },
  'story.picker.active':         { es: '● ACTIVA',                           en: '● ACTIVE' },
  'story.picker.hint':           { es: '💡 La URL incluye la historia + escena. Comparte un link a un punto específico.', en: '💡 The URL includes the story + scene. Share a link to a specific point.' },
  'story.canvas.restart':        { es: 'Reiniciar historia',                 en: 'Restart story' },
  'story.canvas.restart.title':  { es: 'Volver a la escena 1',               en: 'Back to scene 1' },
  'story.canvas.restart.disabled': { es: 'Ya estás en la escena 1',          en: 'Already on scene 1' },
  'story.canvas.restoreLayout':  { es: 'Restaurar layout',                   en: 'Restore layout' },
  'story.canvas.restoreLayout.title': { es: 'Restaurar posiciones por defecto', en: 'Restore default positions' },
  'story.canvas.restoreLayout.disabled': { es: 'No has movido nada todavía', en: 'You haven\'t moved anything yet' },
  'story.canvas.new':            { es: '{n} nuevos',                         en: '{n} new' },
  'story.canvas.prev':           { es: '{n} previos',                        en: '{n} prior' },
  'story.canvas.hidden':         { es: '{n} ocultos',                        en: '{n} hidden' },

  // ── Mindmap view ────────────────────────────────────────────────────────
  'mindmap.eyebrow':             { es: 'MINDMAP VIEW',                       en: 'MINDMAP VIEW' },
  'mindmap.hierarchy':           { es: 'Hierarchy',                          en: 'Hierarchy' },
  'mindmap.hierarchy.roots':     { es: 'root',                               en: 'root' },
  'mindmap.hierarchy.branches':  { es: 'ramas',                              en: 'branches' },
  'mindmap.hierarchy.leaves':    { es: 'hojas',                              en: 'leaves' },
  'mindmap.hierarchy.viewing':   { es: 'Viendo:',                            en: 'Viewing:' },
  'mindmap.deselect':            { es: '× Deseleccionar',                    en: '× Deselect' },
  'mindmap.leaves':              { es: 'HOJAS',                              en: 'LEAVES' },
  'mindmap.components':          { es: 'componentes',                        en: 'components' },
  'mindmap.label':               { es: 'Mindmap',                            en: 'Mindmap' },
  'mindmap.filter':              { es: 'Filtrar',                            en: 'Filter' },
  'mindmap.clear':               { es: '↻ Limpiar',                          en: '↻ Clear' },
  'mindmap.search':              { es: 'Buscar nodo…',                       en: 'Search node…' },

  // ── Footer ──────────────────────────────────────────────────────────────
  'footer.iconsAttribution':     {
    es: 'Los iconos son propiedad de Microsoft. Por favor revisa los términos oficiales de uso:',
    en: 'Icons are property of Microsoft. Please review the official terms of use:'
  },
  'footer.author':               { es: 'AUTHOR',                             en: 'AUTHOR' },

  // ── Common ───────────────────────────────────────────────────────────────
  'common.close':                { es: '× cerrar',                           en: '× close' },

  // ── Compare drawer ───────────────────────────────────────────────────────
  'compare.placeholder':         { es: 'Click en un segundo componente para comparar…', en: 'Click a second component to compare…' },
  'compare.outputs':             { es: 'salidas',                            en: 'outputs' },
  'compare.inputs':              { es: 'entradas',                           en: 'inputs' },
  'compare.uniqueNeighbors':     { es: 'vecinos únicos',                     en: 'unique neighbors' },
  'compare.headerTwo':           { es: '2 componentes',                      en: '2 components' },
  'compare.headerSelected':      { es: '· {n}/2 seleccionados',              en: '· {n}/2 selected' },
  'compare.hintFirst':           { es: '· Click otro nodo para llenar el primer slot', en: '· Click another node to fill the first slot' },
  'compare.hintSecond':          { es: '· Click otro nodo para llenar el segundo slot', en: '· Click another node to fill the second slot' },
  'compare.clear':               { es: 'Limpiar',                            en: 'Clear' },
  'compare.closeTitle':          { es: 'Cerrar Compare (Esc)',               en: 'Close Compare (Esc)' },
  'compare.sharedNeighbors':     { es: 'Vecinos en común',                   en: 'Shared neighbors' },
  'compare.noShared':            { es: '— sin vecinos compartidos directos.', en: '— no direct shared neighbors.' },

  // ── Left panel / Grid ────────────────────────────────────────────────────
  'leftpanel.library':           { es: 'Librería',                           en: 'Library' },
  'leftpanel.filter':            { es: 'Filtrar componentes…',               en: 'Filter components…' },
  'gridview.filter':             { es: 'Filtrar por nombre…',                en: 'Filter by name…' },

  // ── Detail panel (degree rail) ───────────────────────────────────────────
  'panel.totalConnections':      { es: 'conexiones totales',                 en: 'total connections' },
  'panel.outIn':                 { es: 'salida · entrada',                   en: 'out · in' },
  'panel.phase':                 { es: 'Fase',                               en: 'Phase' },
  'panel.coverage':              { es: 'Cobertura',                          en: 'Coverage' },

  // ── Graph view ───────────────────────────────────────────────────────────
  'graph.centralityTop5':        { es: 'Centralidad · Top 5',                en: 'Centrality · Top 5' },
  'graph.degree':                { es: 'Grado',                              en: 'Degree' },

  // ── Tooltip ──────────────────────────────────────────────────────────────
  'tooltip.learnMore':           { es: 'Más info →',                         en: 'Learn more →' },

  // ── Onboarding tour ─────────────────────────────────────────────────────
  'tour.skip':                   { es: 'Omitir',                             en: 'Skip' },
  'tour.next':                   { es: 'Siguiente',                          en: 'Next' },
  'tour.done':                   { es: 'Empezar',                            en: 'Get started' },
  'tour.step':                   { es: 'Paso {n} de {total}',                en: 'Step {n} of {total}' },
  'tour.s1.title':               { es: 'Bienvenido a Intune Map',    en: 'Welcome to Intune Map' },
  'tour.s1.body':                { es: 'Un mapa interactivo del ecosistema de Microsoft Intune: stories, scenario builder, catálogo y grafo. Te muestro lo esencial en 30 segundos.', en: 'An interactive map of the Microsoft Intune ecosystem: stories, scenario builder, catalog and graph. Let me walk you through it in 30 seconds.' },
  'tour.s2.title':               { es: 'Cinco vistas, una para cada viaje',  en: 'Five views, one for each journey' },
  'tour.s2.body':                { es: 'Story narrativa · Scenario para componer arquitecturas · Grid catálogo · Graph red de relaciones · Mindmap jerarquía.', en: 'Story narratives · Scenario to compose architectures · Grid catalog · Graph relationship network · Mindmap hierarchy.' },
  'tour.s3.title':               { es: 'Búsqueda global',                    en: 'Global search' },
  'tour.s3.body':                { es: 'Filtra cualquier componente por nombre o descripción. Funciona en todas las vistas.', en: 'Filter any component by name or description. Works across every view.' },
  'tour.s4.title':               { es: 'Tema e idioma',                      en: 'Theme & language' },
  'tour.s4.body':                { es: 'Alterna tema claro/oscuro y ES/EN en cualquier momento. Tu preferencia queda guardada.', en: 'Toggle light/dark theme and ES/EN any time. Your choice is remembered.' },
  'tour.s5.title':               { es: 'Atajos de teclado',                  en: 'Keyboard shortcuts' },
  'tour.s5.body':                { es: 'Pulsa ? en cualquier momento para ver todos los atajos. Esc cierra cualquier panel.', en: 'Press ? any time to see every shortcut. Esc closes any panel.' },
  'tour.button.title':           { es: 'Ver tour de bienvenida',             en: 'Replay welcome tour' },

  // ── Keyboard shortcuts modal ────────────────────────────────────────────
  'shortcuts.title':             { es: 'Atajos de teclado',                  en: 'Keyboard shortcuts' },
  'shortcuts.hint':              { es: 'Pulsa ? en cualquier momento',       en: 'Press ? any time' },
  'shortcuts.close':             { es: 'Cerrar',                             en: 'Close' },
  'shortcuts.group.nav':         { es: 'Navegación',                         en: 'Navigation' },
  'shortcuts.group.actions':     { es: 'Acciones',                           en: 'Actions' },
  'shortcuts.group.global':      { es: 'Global',                             en: 'Global' },
  'shortcuts.openSearch':        { es: 'Enfocar búsqueda',                   en: 'Focus search' },
  'shortcuts.openHelp':          { es: 'Abrir esta ayuda',                   en: 'Open this help' },
  'shortcuts.closePanel':        { es: 'Cerrar panel / modal',               en: 'Close panel / modal' },
  'shortcuts.toggleTheme':       { es: 'Tema claro / oscuro',                en: 'Light / dark theme' },
  'shortcuts.toggleLocale':      { es: 'Idioma ES / EN',                     en: 'Language ES / EN' },
  'shortcuts.goStory':           { es: 'Ir a Story',                         en: 'Go to Story' },
  'shortcuts.goScenario':        { es: 'Ir a Scenario',                      en: 'Go to Scenario' },
  'shortcuts.goGrid':            { es: 'Ir a Grid',                          en: 'Go to Grid' },
  'shortcuts.goGraph':           { es: 'Ir a Graph',                         en: 'Go to Graph' },
  'shortcuts.goMindmap':         { es: 'Ir a Mindmap',                       en: 'Go to Mindmap' },
  'shortcuts.help.button.title': { es: 'Ver atajos (?)',                     en: 'Keyboard shortcuts (?)' },

  // ── Empty state · Scenario canvas ───────────────────────────────────────
  'empty.scenario.title':        { es: 'Tu lienzo está vacío',               en: 'Your canvas is empty' },
  'empty.scenario.body':         { es: 'Arrastra componentes desde la Library de la izquierda, o carga un escenario prediseñado desde el selector de arriba.', en: 'Drag components from the Library on the left, or load a pre-built scenario from the selector above.' },
  'empty.scenario.cta':          { es: 'Cargar un escenario de ejemplo',     en: 'Load an example scenario' }
}

// Generic picker for bilingual data fields shaped as { es, en }.
// Accepts plain strings for backward compatibility (returns them as-is).
export function pickStr(v, locale = 'es') {
  if (v == null) return ''
  if (typeof v === 'string') return v
  return v[locale] ?? v.es ?? v.en ?? ''
}

// Interpolate {name} placeholders with the provided values map.
export function interp(str, vars) {
  if (!vars) return str
  return str.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`))
}
