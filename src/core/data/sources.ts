export type SourceTopic =
  | 'lifespans'
  | 'ventilation_moisture'
  | 'maintenance_cost'
  | 'swedish_guidance';

export interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string;
  topics: SourceTopic[];
  summary: string;
}

function cleanUrl(url: string): string {
  // Strip common tracking params to keep the citations clean.
  try {
    const u = new URL(url);
    u.searchParams.delete('utm_source');
    u.searchParams.delete('utm_medium');
    u.searchParams.delete('utm_campaign');
    return u.toString();
  } catch {
    return url;
  }
}

export const SOURCES: Source[] = [
  {
    id: 'boverket-ventilation-bostader',
    title: 'Luft och ventilation i bostader',
    publisher: 'Boverket',
    url: cleanUrl(
      'https://www.boverket.se/sv/byggande/halsa-och-inomhusmiljo/ventilation/luft-och-ventilation-i-bostader/'
    ),
    topics: ['ventilation_moisture', 'swedish_guidance'],
    summary: 'Guidance on ventilation and indoor environment in housing.',
  },
  {
    id: 'boverket-ovk',
    title: 'Obligatory Ventilation Control (OVK)',
    publisher: 'Boverket',
    url: cleanUrl(
      'https://www.boverket.se/en/start/laws-and-regulations/national-regulations/obligatory-ventilation-control/'
    ),
    topics: ['ventilation_moisture', 'swedish_guidance'],
    summary: 'Swedish rules and overview of OVK ventilation control.',
  },
  {
    id: 'folkhalsomyndigheten-environmental-health',
    title: 'Environmental health and indoor environment',
    publisher: 'Folkhalsomyndigheten',
    url: cleanUrl(
      'https://www.folkhalsomyndigheten.se/the-public-health-agency-of-sweden/living-conditions-and-lifestyle/environmental-health/'
    ),
    topics: ['ventilation_moisture', 'swedish_guidance'],
    summary: 'Public guidance related to indoor environment and health.',
  },
  {
    id: 'folkhalsomyndigheten-fukt-mikroorganismer',
    title: 'Vagledning om fukt och mikroorganismer',
    publisher: 'Folkhalsomyndigheten',
    url: cleanUrl(
      'https://www.folkhalsomyndigheten.se/regler-och-tillsyn/tillsynsvagledning-och-stod/halsoskydd-vagledning-och-tillsyn/tillsynsvagledning-om-fukt-och-mikroorganismer/'
    ),
    topics: ['ventilation_moisture', 'swedish_guidance'],
    summary: 'Guidance on dampness, mold and microorganisms for environmental health.',
  },
  {
    id: 'sbr-teknisk-livslangd',
    title: 'Teknisk livslangd (oversiktstabell)',
    publisher: 'SBR / hidden defects insurance site',
    url: cleanUrl('https://doldafelforsakring.se/teknisk-livslangd/'),
    topics: ['lifespans', 'maintenance_cost'],
    summary: 'Reference table of technical service life for common building components.',
  },
  {
    id: 'lansforsakringar-teknisk-livslangd',
    title: 'Teknisk livslangd for material och installationer',
    publisher: 'Lansforsakringar',
    url: cleanUrl('https://www.lansforsakringar.se/privat/tips-guider/hem/renovera/teknisk-livslangd/'),
    topics: ['lifespans', 'maintenance_cost'],
    summary: 'Insurance-industry maintenance guidance and service-life references.',
  },
  {
    id: 'bca-review-2024',
    title: 'Comprehensive review of building condition assessment models',
    publisher: 'ScienceDirect',
    url: cleanUrl('https://www.sciencedirect.com/science/article/pii/S2590123024004304'),
    topics: ['maintenance_cost'],
    summary: 'Background on component-level aggregation (BCI/BCM-style) in condition assessment.',
  },
  {
    id: 'faqih-defect-based',
    title: 'Defect-based building condition assessment',
    publisher: 'PolyU IRA',
    url: cleanUrl('https://ira.lib.polyu.edu.hk/bitstream/10397/97502/1/Faqih_Defect-Based_Building_Condition.pdf'),
    topics: ['maintenance_cost', 'ventilation_moisture'],
    summary: 'Supports defect/risk modifier framing in building condition assessment.',
  },
  {
    id: 'mdpi-maintenance-framework',
    title: 'Framework for building condition and maintenance decisions',
    publisher: 'MDPI Buildings',
    url: cleanUrl('https://www.mdpi.com/2075-5309/15/9/1511'),
    topics: ['maintenance_cost'],
    summary: 'Condition assessment used for maintenance prioritization and cost exposure framing.',
  },
];

export const TOPIC_ORDER: SourceTopic[] = [
  'lifespans',
  'ventilation_moisture',
  'maintenance_cost',
  'swedish_guidance',
];
