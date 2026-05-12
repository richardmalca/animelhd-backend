import type { SVGAttributes } from 'react';
import { Zap } from 'lucide-react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <Zap {...props} className={props.className} fill="currentColor" />
    );
}
