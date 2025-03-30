/**
 * Simple test script for debugging G.L.Y.P.H. parsing
 */

// Define a simplified version of the parser
function parseGlyphicSpell(rawSpell) {
  const lines = rawSpell.trim().split('\n');
  const spell = {
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
    
    console.log(`Processing line: "${trimmedLine}"`);
    
    // Check for section markers
    if (trimmedLine.startsWith('🜁')) {
      spell.command = trimmedLine.substring(1).trim();
      console.log(`Found command: ${spell.command}`);
      currentSection = 'command';
    } else if (trimmedLine.startsWith('🜂')) {
      console.log('Found panels section');
      currentSection = 'panels';
    } else if (trimmedLine.startsWith('🜅')) {
      console.log('Found UI section');
      currentSection = 'ui';
    } else if (trimmedLine.startsWith('🜆')) {
      console.log('Found logic section');
      currentSection = 'logic';
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
      } else if (currentSection === 'ui') {
        console.log(`UI line: ${trimmedLine}`);
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
      } else if (currentSection === 'logic') {
        console.log(`Logic line: ${trimmedLine}`);
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
      }
    }
  }
  
  return spell;
}

// Example glyphic spell to test
const exampleSpell = `
🜁 BloomStellarConsole
🜂 Panels:
    🜄 QuditEntangleGrid
    🜃 GlyphOscilloscope
    🝮 MessagePortal
🜅 UI: DarkGlass + GoldLattice + PhaseBloom
🜆 Logic: MuskCoreLive + EntropyMonitor + 🜹Recovery
🜇 Deploy to: /control
`;

console.log('Testing G.L.Y.P.H. interpretation...');

// Parse the spell
const spell = parseGlyphicSpell(exampleSpell);
console.log('\nParsed spell:', JSON.stringify(spell, null, 2));

// Test verification criteria
const isValid = 
  spell.command && 
  spell.panels.length > 0 && 
  spell.uiStyles.length > 0 && 
  spell.logicModules.length > 0 &&
  spell.deployPath;

console.log('\nValidation:');
console.log('Is valid:', isValid);
console.log('Command:', spell.command);
console.log('Panels:', spell.panels);
console.log('UI Styles:', spell.uiStyles);
console.log('Logic Modules:', spell.logicModules);
console.log('Deploy Path:', spell.deployPath);
console.log('Recovery Glyph:', spell.recoveryGlyph);