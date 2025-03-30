/**
 * G.L.Y.P.H. - Generalized Lattice Yield Protocolic Hieroglyphs
 * Interpreter for translating glyphic spells into functional interface components
 */

export type GlyphicPanelType = 'QuditEntangleGrid' | 'GlyphOscilloscope' | 'MessagePortal';

export type UIStyleType = 'DarkGlass' | 'GoldLattice' | 'PhaseBloom' | 'BlackbodyGlass';

export type LogicType = 'MuskCoreLive' | 'EntropyMonitor' | 'Recovery';

export interface GlyphicSpell {
  command: string;
  panels: GlyphicPanelType[];
  uiStyles: UIStyleType[];
  logicModules: LogicType[];
  deployPath: string;
  recoveryGlyph?: string;
}

/**
 * Parse a raw glyphic spell string into a structured GlyphicSpell object
 */
export function parseGlyphicSpell(rawSpell: string): GlyphicSpell {
  const lines = rawSpell.trim().split('\n');
  const spell: GlyphicSpell = {
    command: '',
    panels: [],
    uiStyles: [],
    logicModules: [],
    deployPath: '/control'
  };
  
  let currentSection = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // For debugging
    console.log(`Processing line: "${trimmedLine}"`);
    
    // Check for section markers
    if (trimmedLine.startsWith('🜁')) {
      spell.command = trimmedLine.substring(2).trim(); // Skip emoji and space
      console.log(`Found command: ${spell.command}`);
      currentSection = 'command';
    } else if (trimmedLine.startsWith('🜂')) {
      console.log('Found panels section');
      currentSection = 'panels';
    } else if (trimmedLine.startsWith('🜅')) {
      console.log('Found UI section');
      currentSection = 'ui';
      
      // Process UI styles directly from the section header line
      if (trimmedLine.includes('DarkGlass')) {
        spell.uiStyles.push('DarkGlass');
        console.log('Added DarkGlass style');
      }
      if (trimmedLine.includes('GoldLattice')) {
        spell.uiStyles.push('GoldLattice');
        console.log('Added GoldLattice style');
      }
      if (trimmedLine.includes('PhaseBloom')) {
        spell.uiStyles.push('PhaseBloom');
        console.log('Added PhaseBloom style');
      }
      if (trimmedLine.includes('BlackbodyGlass')) {
        spell.uiStyles.push('BlackbodyGlass');
        console.log('Added BlackbodyGlass style');
      }
    } else if (trimmedLine.startsWith('🜆')) {
      console.log('Found logic section');
      currentSection = 'logic';
      
      // Process logic modules directly from the section header line
      if (trimmedLine.includes('MuskCore')) {
        spell.logicModules.push('MuskCoreLive');
        console.log('Added MuskCoreLive module');
      }
      if (trimmedLine.includes('Entropy')) {
        spell.logicModules.push('EntropyMonitor');
        console.log('Added EntropyMonitor module');
      }
      if (trimmedLine.includes('Recovery')) {
        spell.logicModules.push('Recovery');
        console.log('Added Recovery module');
        if (trimmedLine.includes('🜹')) {
          spell.recoveryGlyph = '🜹';
          console.log('Added recovery glyph');
        }
      }
    } else if (trimmedLine.startsWith('🜇')) {
      console.log('Found deploy section');
      const deployPath = trimmedLine.match(/to:\s*(\S+)/);
      if (deployPath && deployPath[1]) {
        spell.deployPath = deployPath[1];
        console.log(`Found deploy path: ${spell.deployPath}`);
      }
    } else {
      // Process content within sections
      console.log(`Processing content in section: ${currentSection}`);
      
      if (currentSection === 'panels') {
        if (trimmedLine.includes('🜄')) {
          spell.panels.push('QuditEntangleGrid');
          console.log('Added QuditEntangleGrid panel');
        } else if (trimmedLine.includes('🜃')) {
          spell.panels.push('GlyphOscilloscope');
          console.log('Added GlyphOscilloscope panel');
        } else if (trimmedLine.includes('🝮')) {
          spell.panels.push('MessagePortal');
          console.log('Added MessagePortal panel');
        }
      } 
      // Note: UI and Logic are now processed at the section header line
    }
  }
  
  return spell;
}

/**
 * Generate a UI configuration object from a parsed glyphic spell
 */
export function generateUIConfig(spell: GlyphicSpell) {
  return {
    theme: {
      dark: spell.uiStyles.includes('DarkGlass') || spell.uiStyles.includes('BlackbodyGlass'),
      primaryColor: spell.uiStyles.includes('GoldLattice') ? 'amber' : 'indigo',
      glowEffect: spell.uiStyles.includes('PhaseBloom'),
      glassEffect: spell.uiStyles.some(style => style.includes('Glass')),
      latticeLines: spell.uiStyles.includes('GoldLattice'),
    },
    layout: {
      panels: spell.panels.map(panel => ({
        type: panel,
        visible: true,
        expanded: true,
      })),
      recoveryGlyph: spell.recoveryGlyph,
    },
    logic: {
      useMuskCore: spell.logicModules.includes('MuskCoreLive'),
      monitorEntropy: spell.logicModules.includes('EntropyMonitor'),
      enableRecovery: spell.logicModules.includes('Recovery'),
    }
  };
}

/**
 * Example of a glyphic spell to test the interpreter
 */
export const exampleGlyphicSpell = `
🜁 BloomStellarConsole
🜂 Panels:
    🜄 QuditEntangleGrid
    🜃 GlyphOscilloscope
    🝮 MessagePortal
🜅 UI: DarkGlass + GoldLattice + PhaseBloom
🜆 Logic: MuskCoreLive + EntropyMonitor + 🜹Recovery
🜇 Deploy to: /control
`;

/**
 * Test the interpreter with the example spell
 */
export function testInterpreter() {
  const parsedSpell = parseGlyphicSpell(exampleGlyphicSpell);
  const uiConfig = generateUIConfig(parsedSpell);
  console.log('Parsed Spell:', parsedSpell);
  console.log('UI Configuration:', uiConfig);
  return { parsedSpell, uiConfig };
}