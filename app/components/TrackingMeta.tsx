import { Meta } from 'react-router';
import { useEffect, useState } from 'react';
import { PixelService, type Pixel } from '../services/pixelService';

export function TrackingMeta() {
  const [facebookPixels, setFacebookPixels] = useState<Pixel[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadPixels = async () => {
      try {
        const pixels = await PixelService.getFacebookPixels();
        setFacebookPixels(pixels);
      } catch (error) {
        console.error('Erreur chargement pixels Facebook:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadPixels();
  }, []);

  // Generate Facebook Pixel script
  const generateFacebookScript = (pixels: Pixel[]) => {
    if (pixels.length === 0) return '';

    const pixelIds = pixels.map(p => p.pixel_id);

    return `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      ${pixelIds.map(id => `fbq('init', '${id}');`).join('\n      ')}
      fbq('track', 'PageView');
    `;
  };

  // Generate noscript image tags for each pixel
  const generateNoScriptTags = (pixels: Pixel[]) => {
    return pixels.map(pixel => 
      `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixel.pixel_id}&ev=PageView&noscript=1" />`
    ).join('');
  };

  if (!isLoaded) {
    return null; // Ou un loader si nécessaire
  }

  return (
    <>
      {facebookPixels.length > 0 && (
        <>
          <script
            dangerouslySetInnerHTML={{
              __html: generateFacebookScript(facebookPixels)
            }}
          />
          <noscript
            dangerouslySetInnerHTML={{
              __html: generateNoScriptTags(facebookPixels)
            }}
          />
        </>
      )}
    </>
  );
}