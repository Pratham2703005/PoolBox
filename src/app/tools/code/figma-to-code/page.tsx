import { Metadata } from 'next';
import FigmaExtractorTool from '@/components/tools/figma-to-code/FigmaExtractorTool';

export const metadata: Metadata = {
  title: 'Figma to Next.js Code | Developer Toolbox',
  description:
    'Extract Figma designs and convert to ready-to-use React/Tailwind components. Get JSX code, asset URLs, and raw design data instantly.',
};

export default function FigmaToCodePage() {
  return <FigmaExtractorTool />;
}
