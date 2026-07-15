/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project } from '../types';

/**
 * Generates a valid GAEB DA XML 3.3 compliant XML string in X83 format.
 */
export function generateGaebXml(project: Project): string {
  const dateStr = project.date || new Date().toISOString().split('T')[0];
  
  const escapeXml = (unsafe: string) => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  };

  let xml = `<?xml version="1.0" encoding="utf-8"?>\n`;
  xml += `<GAEB xmlns="http://www.gaeb.de/GAEB_DA_XML/DA83/3.3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.gaeb.de/GAEB_DA_XML/DA83/3.3 GAEB_DA_XML_3.3.xsd">\n`;
  
  // GAEBInfo block
  xml += `  <GAEBInfo>\n`;
  xml += `    <Version>3.3</Version>\n`;
  xml += `    <VersDate>2021-05</VersDate>\n`;
  xml += `    <Date>${dateStr}</Date>\n`;
  xml += `    <ProgSystem>Malerprofis Angebote</ProgSystem>\n`;
  xml += `  </GAEBInfo>\n`;

  // Award block
  xml += `  <Award>\n`;
  xml += `    <DP>83</DP>\n`;
  
  // BoQ block
  xml += `    <BoQ>\n`;
  xml += `      <BoQInfo>\n`;
  xml += `        <Name>${escapeXml(project.name)}</Name>\n`;
  if (project.description) {
    xml += `        <Description>${escapeXml(project.description)}</Description>\n`;
  }
  xml += `      </BoQInfo>\n`;
  
  // BoQBody block
  xml += `      <BoQBody>\n`;
  
  project.rooms.forEach((room, roomIdx) => {
    const roomNum = roomIdx + 1;
    xml += `        <BoQCtgy ID="R_${room.id}" RNoPart="${roomNum}">\n`;
    xml += `          <LblTx>\n`;
    xml += `            <p><span>Raum: ${escapeXml(room.name)}</span></p>\n`;
    xml += `          </LblTx>\n`;
    xml += `          <BoQBody>\n`;
    
    if (room.positions.length > 0) {
      xml += `            <Itemlist>\n`;
      room.positions.forEach((pos, posIdx) => {
        const posNum = posIdx + 1;
        const total = pos.totalPrice || (pos.quantity * pos.price);
        
        xml += `              <Item ID="P_${pos.id}" RNoPart="${posNum}">\n`;
        xml += `                <Qty>${pos.quantity.toFixed(3)}</Qty>\n`;
        xml += `                <QU>${escapeXml(pos.unit)}</QU>\n`;
        xml += `                <UP>${pos.price.toFixed(2)}</UP>\n`;
        xml += `                <IT>${total.toFixed(2)}</IT>\n`;
        xml += `                <Description>\n`;
        xml += `                  <CompleteText>\n`;
        xml += `                    <OutlineText>\n`;
        xml += `                      <OutlTxt>\n`;
        xml += `                        <TextOutlTxt>\n`;
        xml += `                          <span>${escapeXml(pos.name)}</span>\n`;
        xml += `                        </TextOutlTxt>\n`;
        xml += `                      </OutlTxt>\n`;
        xml += `                    </OutlineText>\n`;
        xml += `                  </CompleteText>\n`;
        xml += `                </Description>\n`;
        xml += `              </Item>\n`;
      });
      xml += `            </Itemlist>\n`;
    }
    
    xml += `          </BoQBody>\n`;
    xml += `        </BoQCtgy>\n`;
  });
  
  xml += `      </BoQBody>\n`;
  xml += `    </BoQ>\n`;
  xml += `  </Award>\n`;
  xml += `</GAEB>\n`;

  return xml;
}

/**
 * Triggers a client-side download of the GAEB XML content with .x83 extension.
 */
export function downloadGaebFile(xmlContent: string, filename: string): void {
  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.x83') ? filename : `${filename}.x83`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
