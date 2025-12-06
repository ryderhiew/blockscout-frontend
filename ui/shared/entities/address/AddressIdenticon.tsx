import { Box } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import React from 'react';

import config from 'configs/app';
import * as cookies from 'lib/cookies';
import { Image } from 'toolkit/chakra/image';
import IdenticonGithub from 'ui/shared/IdenticonGithub';

interface IconProps {
  hash: string;
  size: number;
}

const Icon = dynamic(
  async() => {
    const type = cookies.get(cookies.NAMES.ADDRESS_IDENTICON_TYPE) || config.UI.views.address.identiconType;
    switch (type) {
      case 'github': {

        return (props: IconProps) => <IdenticonGithub iconSize={ props.size } seed={ props.hash }/>;
      }

      case 'blockie': {
        const { blo } = (await import('blo'));

        return (props: IconProps) => {
          // Add null check
          if (!props.hash) return null;
          const data = blo(props.hash as `0x${ string }`, props.size);
          return (
            <Image
              src={ data }
              alt={ `Identicon for ${ props.hash }}` }
            />
          );
        };
      }

      case 'jazzicon': {
        const Jazzicon = await import('react-jazzicon');

        return (props: IconProps) => {
          // Add null check before calling jsNumberForAddress
          if (!props.hash || typeof props.hash !== 'string' || props.hash.length < 2) return null;
          
          try {
            return (
              <Jazzicon.default
                diameter={ props.size }
                seed={ Jazzicon.jsNumberForAddress(props.hash) }
              />
            );
          } catch (error) {
            console.error('Jazzicon error:', error);
            return null;
          }
        };
      }

      case 'gradient_avatar': {
        const GradientAvatar = (await import('gradient-avatar')).default;

        return (props: IconProps) => {
          // Add null check
          if (!props.hash) return null;
          const svg = GradientAvatar(props.hash, props.size, 'circle');
          return <Box display="flex" dangerouslySetInnerHTML={{ __html: svg }}/>;
        };
      }

      case 'nouns': {
        const NounsIdenticon = (await import('./NounsIdenticon')).default;

        return (props: IconProps) => {
          return <NounsIdenticon hash={ props.hash } size={ props.size }/>;
        };
      }

      default: {
        return () => null;
      }
    }
  }, {
    ssr: false,
  });

type Props = IconProps;

const AddressIdenticon = ({ size, hash }: Props) => {
  // Add comprehensive null/undefined checks
  if (!hash || typeof hash !== 'string' || hash.length < 2) {
    return null;
  }

  // Validate it looks like an address (starts with 0x and has reasonable length)
  if (!hash.startsWith('0x') || hash.length < 10) {
    return null;
  }

  return (
    <Box boxSize={ `${ size }px` } borderRadius="full" overflow="hidden">
      <Icon size={ size } hash={ hash }/>
    </Box>
  );
};

export default React.memo(AddressIdenticon);