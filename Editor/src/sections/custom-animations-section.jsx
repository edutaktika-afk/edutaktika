/**
 * Custom Animations Section - Replaces Polotno's built-in animation section
 * 
 * This section definition can be used to replace the default "animation" section
 * with our custom version that includes placeholder buttons.
 */

import { SectionTab } from 'polotno/side-panel';
import { CustomAnimationsPanel } from './custom-animations-panel';
import { observer } from 'mobx-react-lite';
import { t } from 'polotno/utils/l10n';

export const CustomAnimationsSection = {
  name: 'animation', // Same name as Polotno's internal section to replace it
  Tab: () => null, // No tab - it's opened via toolbar button
  Panel: CustomAnimationsPanel,
};

