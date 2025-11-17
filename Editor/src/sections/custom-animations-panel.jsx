/**
 * Custom Animations Panel - Extended version of Polotno's built-in AnimationsPanel
 * 
 * This recreates the full functionality of Polotno's animation panel and adds
 * custom placeholder animation buttons at the bottom.
 * 
 * LIMITATIONS & WORKAROUNDS:
 * 1. Polotno's source is minified, so we recreate the component from the minified code
 * 2. We must match the exact structure and behavior to ensure compatibility
 * 3. Internal Polotno APIs (setAnimation, animations array) are used directly
 * 4. This component will need updates if Polotno changes their internal APIs
 */

import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button, NumericInput, MenuItem, Slider, Select } from '@blueprintjs/core';
import { Cross } from '@blueprintjs/icons';
import { t } from 'polotno/utils/l10n';

// NumberInput component (recreated from Polotno)
export const NumberInput = ({ value, onValueChange, ...props }) => {
  const [text, setText] = React.useState(value.toString());
  React.useEffect(() => {
    setText(value.toString());
  }, [value]);
  return (
    <NumericInput
      value={text}
      onValueChange={(num, str) => {
        setText(str);
        if (!Number.isNaN(num)) {
          onValueChange(num);
        }
      }}
      {...props}
    />
  );
};

// SVG Icons (recreated from Polotno's minified code)
const MoveIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: 0 }}>
    <path d="M9.88114 6.74408C9.79978 6.66282 9.73524 6.56631 9.69121 6.46009C9.64718 6.35387 9.62451 6.24001 9.62451 6.12502C9.62451 6.01003 9.64718 5.89617 9.69121 5.78994C9.73524 5.68372 9.79978 5.58722 9.88114 5.50595L13.3811 2.00595C13.4624 1.9246 13.5589 1.86006 13.6651 1.81603C13.7714 1.77199 13.8852 1.74933 14.0002 1.74933C14.1152 1.74933 14.229 1.77199 14.3353 1.81603C14.4415 1.86006 14.538 1.9246 14.6193 2.00595L18.1193 5.50595C18.2834 5.67014 18.3757 5.89282 18.3757 6.12502C18.3757 6.35721 18.2834 6.57989 18.1193 6.74408C17.9551 6.90827 17.7324 7.0005 17.5002 7.0005C17.268 7.0005 17.0453 6.90827 16.8811 6.74408L14.8752 4.73705V10.5C14.8752 10.7321 14.783 10.9546 14.6189 11.1187C14.4548 11.2828 14.2323 11.375 14.0002 11.375C13.7681 11.375 13.5456 11.2828 13.3815 11.1187C13.2174 10.9546 13.1252 10.7321 13.1252 10.5V4.73705L11.1193 6.74408C11.038 6.82543 10.9415 6.88997 10.8353 6.93401C10.729 6.97804 10.6152 7.00071 10.5002 7.00071C10.3852 7.00071 10.2714 6.97804 10.1651 6.93401C10.0589 6.88997 9.9624 6.82543 9.88114 6.74408ZM16.8811 21.256L14.8752 23.263V17.5C14.8752 17.268 14.783 17.0454 14.6189 16.8813C14.4548 16.7172 14.2323 16.625 14.0002 16.625C13.7681 16.625 13.5456 16.7172 13.3815 16.8813C13.2174 17.0454 13.1252 17.268 13.1252 17.5V23.263L11.1193 21.256C10.9551 21.0918 10.7324 20.9995 10.5002 20.9995C10.268 20.9995 10.0453 21.0918 9.88114 21.256C9.71695 21.4201 9.62471 21.6428 9.62471 21.875C9.62471 22.1072 9.71695 22.3299 9.88114 22.4941L13.3811 25.9941C13.4624 26.0754 13.5589 26.14 13.6651 26.184C13.7714 26.228 13.8852 26.2507 14.0002 26.2507C14.1152 26.2507 14.229 26.228 14.3353 26.184C14.4415 26.14 14.538 26.0754 14.6193 25.9941L18.1193 22.4941C18.2834 22.3299 18.3757 22.1072 18.3757 21.875C18.3757 21.6428 18.2834 21.4201 18.1193 21.256C17.9551 21.0918 17.7324 20.9995 17.5002 20.9995C17.268 20.9995 17.0453 21.0918 16.8811 21.256ZM25.9943 13.381L22.4943 9.88095C22.3301 9.71677 22.1074 9.62453 21.8752 9.62453C21.643 9.62453 21.4203 9.71677 21.2561 9.88095C21.092 10.0451 20.9997 10.2678 20.9997 10.5C20.9997 10.7322 21.092 10.9549 21.2561 11.1191L23.2632 13.125H17.5002C17.2681 13.125 17.0456 13.2172 16.8815 13.3813C16.7174 13.5454 16.6252 13.768 16.6252 14C16.6252 14.2321 16.7174 14.4546 16.8815 14.6187C17.0456 14.7828 17.2681 14.875 17.5002 14.875H23.2632L21.2561 16.881C21.092 17.0451 20.9997 17.2678 20.9997 17.5C20.9997 17.7322 21.092 17.9549 21.2561 18.1191C21.4203 18.2833 21.643 18.3755 21.8752 18.3755C22.1074 18.3755 22.3301 18.2833 22.4943 18.1191L25.9943 14.6191C26.0756 14.5378 26.1402 14.4413 26.1842 14.3351C26.2282 14.2289 26.2509 14.115 26.2509 14C26.2509 13.885 26.2282 13.7712 26.1842 13.6649C26.1402 13.5587 26.0756 13.4622 25.9943 13.381ZM4.73723 14.875H10.5002C10.7323 14.875 10.9548 14.7828 11.1189 14.6187C11.283 14.4546 11.3752 14.2321 11.3752 14C11.3752 13.768 11.283 13.5454 11.1189 13.3813C10.9548 13.2172 10.7323 13.125 10.5002 13.125H4.73723L6.74426 11.1191C6.90845 10.9549 7.00069 10.7322 7.00069 10.5C7.00069 10.2678 6.90845 10.0451 6.74426 9.88095C6.58008 9.71677 6.35739 9.62453 6.1252 9.62453C5.89301 9.62453 5.67032 9.71677 5.50614 9.88095L2.00614 13.381C1.92478 13.4622 1.86024 13.5587 1.81621 13.6649C1.77218 13.7712 1.74951 13.885 1.74951 14C1.74951 14.115 1.77218 14.2289 1.81621 14.3351C1.86024 14.4413 1.92478 14.5378 2.00614 14.6191L5.50614 18.1191C5.67032 18.2833 5.89301 18.3755 6.1252 18.3755C6.35739 18.3755 6.58008 18.2833 6.74426 18.1191C6.90845 17.9549 7.00069 17.7322 7.00069 17.5C7.00069 17.2678 6.90845 17.0451 6.74426 16.881L4.73723 14.875Z" fill="currentColor" />
  </svg>
);

const FadeIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: 0 }}>
    <circle cx="7" cy="14" r="5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
    <circle cx="14" cy="14" r="5" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="2" strokeOpacity="0.6" />
    <circle cx="21" cy="14" r="5" fill="currentColor" fillOpacity="0.9" stroke="currentColor" strokeWidth="2" strokeOpacity="1" />
  </svg>
);

const ZoomIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: 0 }}>
    <path d="M15.75 11.375V7C15.75 6.76793 15.8422 6.54537 16.0063 6.38128C16.1704 6.21719 16.3929 6.125 16.625 6.125C16.8571 6.125 17.0796 6.21719 17.2437 6.38128C17.4078 6.54537 17.5 6.76793 17.5 7V9.26297L22.1309 4.63094C22.2951 4.46675 22.5178 4.37451 22.75 4.37451C22.9822 4.37451 23.2049 4.46675 23.3691 4.63094C23.5332 4.79512 23.6255 5.0178 23.6255 5.25C23.6255 5.48219 23.5332 5.70488 23.3691 5.86906L18.737 10.5H21C21.2321 10.5 21.4546 10.5922 21.6187 10.7563C21.7828 10.9204 21.875 11.1429 21.875 11.375C21.875 11.6071 21.7828 11.8296 21.6187 11.9937C21.4546 12.1578 21.2321 12.25 21 12.25H16.625C16.3929 12.25 16.1704 12.1578 16.0063 11.9937C15.8422 11.8296 15.75 11.6071 15.75 11.375ZM11.375 15.75H7C6.76793 15.75 6.54537 15.8422 6.38128 16.0063C6.21719 16.1704 6.125 16.3929 6.125 16.625C6.125 16.8571 6.21719 17.0796 6.38128 17.2437C6.54537 17.4078 6.76793 17.5 7 17.5H9.26297L4.63094 22.1309C4.46675 22.2951 4.37451 22.5178 4.37451 22.75C4.37451 22.9822 4.46675 23.2049 4.63094 23.3691C4.79512 23.5332 5.0178 23.6255 5.25 23.6255C5.48219 23.6255 5.70488 23.5332 5.86906 23.3691L10.5 18.737V21C10.5 21.2321 10.5922 21.4546 10.7563 21.6187C10.9204 21.7828 11.1429 21.875 11.375 21.875C11.6071 21.875 11.8296 21.7828 11.9937 21.6187C12.1578 21.4546 12.25 21.2321 12.25 21V16.625C12.25 16.3929 12.1578 16.1704 11.9937 16.0063C11.8296 15.8422 11.6071 15.75 11.375 15.75ZM18.737 17.5H21C21.2321 17.5 21.4546 17.4078 21.6187 17.2437C21.7828 17.0796 21.875 16.8571 21.875 16.625C21.875 16.3929 21.7828 16.1704 21.6187 16.0063C21.4546 15.8422 21.2321 15.75 21 15.75H16.625C16.3929 15.75 16.1704 15.8422 16.0063 16.0063C15.8422 16.1704 15.75 16.3929 15.75 16.625V21C15.75 21.2321 15.8422 21.4546 16.0063 21.6187C16.1704 21.7828 16.3929 21.875 16.625 21.875C16.8571 21.875 17.0796 21.7828 17.2437 21.6187C17.4078 21.4546 17.5 21.2321 17.5 21V18.737L22.1309 23.3691C22.2122 23.4504 22.3087 23.5148 22.415 23.5588C22.5212 23.6028 22.635 23.6255 22.75 23.6255C22.865 23.6255 22.9788 23.6028 23.085 23.5588C23.1913 23.5148 23.2878 23.4504 23.3691 23.3691C23.4504 23.2878 23.5148 23.1913 23.5588 23.085C23.6028 22.9788 23.6255 22.865 23.6255 22.75C23.6255 22.635 23.6028 22.5212 23.5588 22.415C23.5148 22.3087 23.4504 22.2122 23.3691 22.1309L18.737 17.5ZM11.375 6.125C11.1429 6.125 10.9204 6.21719 10.7563 6.38128C10.5922 6.54537 10.5 6.76793 10.5 7V9.26297L5.86906 4.63094C5.70488 4.46675 5.48219 4.37451 5.25 4.37451C5.0178 4.37451 4.79512 4.46675 4.63094 4.63094C4.46675 4.79512 4.37451 5.0178 4.37451 5.25C4.37451 5.48219 4.46675 5.70488 4.63094 5.86906L9.26297 10.5H7C6.76793 10.5 6.54537 10.5922 6.38128 10.7563C6.21719 10.9204 6.125 11.1429 6.125 11.375C6.125 11.6071 6.21719 11.8296 6.38128 11.9937C6.54537 12.1578 6.76793 12.25 7 12.25H11.375C11.6071 12.25 11.8296 12.1578 11.9937 11.9937C12.1578 11.8296 12.25 11.6071 12.25 11.375V7C12.25 6.76793 12.1578 6.54537 11.9937 6.38128C11.8296 6.21719 11.6071 6.125 11.375 6.125Z" fill="currentColor" />
  </svg>
);

const RotateIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" style={{ margin: 0 }}>
    <path d="M9.625 11.375H4.375C4.14294 11.375 3.92038 11.2828 3.75628 11.1187C3.59219 10.9546 3.5 10.7321 3.5 10.5V5.25001C3.5 5.01794 3.59219 4.79538 3.75628 4.63129C3.92038 4.46719 4.14294 4.37501 4.375 4.37501C4.60706 4.37501 4.82962 4.46719 4.99372 4.63129C5.15781 4.79538 5.25 5.01794 5.25 5.25001V8.38797L6.85016 6.78782C8.80164 4.82651 11.452 3.72026 14.2188 3.71219H14.2767C17.0199 3.70513 19.6555 4.77908 21.6125 6.70141C21.7723 6.86488 21.8618 7.0844 21.8618 7.313C21.8618 7.5416 21.7723 7.76112 21.6126 7.92461C21.4528 8.0881 21.2354 8.18257 21.0068 8.18781C20.7783 8.19306 20.5568 8.10865 20.3897 7.95266C18.7584 6.3515 16.5625 5.45684 14.2767 5.46219H14.2275C11.9221 5.46929 9.71368 6.39096 8.08719 8.02485L6.48703 9.62501H9.625C9.85706 9.62501 10.0796 9.71719 10.2437 9.88129C10.4078 10.0454 10.5 10.2679 10.5 10.5C10.5 10.7321 10.4078 10.9546 10.2437 11.1187C10.0796 11.2828 9.85706 11.375 9.625 11.375ZM23.625 16.625H18.375C18.1429 16.625 17.9204 16.7172 17.7563 16.8813C17.5922 17.0454 17.5 17.2679 17.5 17.5C17.5 17.7321 17.5922 17.9546 17.7563 18.1187C17.9204 18.2828 18.1429 18.375 18.375 18.375H21.513L19.9128 19.9752C18.2866 21.6088 16.0786 22.5304 13.7736 22.5378H13.7244C11.4386 22.5432 9.24264 21.6485 7.61141 20.0473C7.52991 19.964 7.43257 19.8977 7.32511 19.8525C7.21764 19.8073 7.10223 19.784 6.98564 19.784C6.86904 19.784 6.75363 19.8073 6.64617 19.8525C6.53872 19.8978 6.44138 19.964 6.35989 20.0474C6.2784 20.1308 6.2144 20.2296 6.17164 20.3381C6.12889 20.4466 6.10824 20.5625 6.11091 20.679C6.11359 20.7956 6.13953 20.9105 6.18721 21.0169C6.2349 21.1232 6.30337 21.219 6.38859 21.2986C8.3456 23.2209 10.9812 24.2949 13.7244 24.2878H13.7812C16.5476 24.2795 19.1975 23.1732 21.1488 21.2122L22.75 19.612V22.75C22.75 22.9821 22.8422 23.2046 23.0063 23.3687C23.1704 23.5328 23.3929 23.625 23.625 23.625C23.8571 23.625 24.0796 23.5328 24.2437 23.3687C24.4078 23.2046 24.5 22.9821 24.5 22.75V17.5C24.5 17.2679 24.4078 17.0454 24.2437 16.8813C24.0796 16.7172 23.8571 16.625 23.625 16.625Z" fill="currentColor" />
  </svg>
);

const BlinkIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" style={{ margin: 0 }}>
    <path d="M24.9374 19.1406C24.8375 19.1976 24.7273 19.2343 24.6132 19.2487C24.499 19.263 24.3831 19.2547 24.2722 19.2243C24.1613 19.1938 24.0574 19.1417 23.9666 19.0711C23.8758 19.0004 23.7999 18.9126 23.7431 18.8125L21.6649 15.1813C20.4568 15.9982 19.124 16.6136 17.7187 17.0034L18.3607 20.8556C18.3797 20.969 18.3761 21.0851 18.3502 21.1971C18.3242 21.3091 18.2765 21.4149 18.2096 21.5085C18.1428 21.602 18.0582 21.6815 17.9606 21.7423C17.8631 21.8031 17.7545 21.8441 17.641 21.863C17.5944 21.8706 17.5472 21.8746 17.4999 21.875C17.2929 21.8747 17.0928 21.801 16.935 21.667C16.7772 21.5331 16.672 21.3475 16.6381 21.1433L16.007 17.3611C14.6761 17.5463 13.326 17.5463 11.9951 17.3611L11.364 21.1433C11.33 21.3479 11.2245 21.5337 11.0663 21.6677C10.908 21.8018 10.7073 21.8752 10.4999 21.875C10.4516 21.8748 10.4033 21.8708 10.3556 21.863C10.2421 21.8441 10.1335 21.8031 10.036 21.7423C9.93842 21.6815 9.8538 21.602 9.78696 21.5085C9.72012 21.4149 9.67238 21.3091 9.64645 21.1971C9.62053 21.0851 9.61694 20.969 9.63588 20.8556L10.2812 17.0034C8.87641 16.6123 7.54441 15.9958 6.33713 15.178L4.26557 18.8125C4.14954 19.0147 3.95794 19.1625 3.73292 19.2234C3.50791 19.2843 3.26791 19.2534 3.06573 19.1374C2.86354 19.0213 2.71573 18.8297 2.65481 18.6047C2.59389 18.3797 2.62485 18.1397 2.74088 17.9375L4.92838 14.1094C4.16002 13.4456 3.45348 12.7134 2.81744 11.9219C2.73812 11.8333 2.67768 11.7295 2.63981 11.6168C2.60194 11.5041 2.58744 11.3849 2.59718 11.2664C2.60693 11.1479 2.64071 11.0327 2.69649 10.9277C2.75226 10.8227 2.82884 10.7301 2.92156 10.6557C3.01428 10.5813 3.1212 10.5266 3.23578 10.4948C3.35036 10.4631 3.4702 10.4551 3.58799 10.4712C3.70578 10.4873 3.81905 10.5273 3.92088 10.5887C4.02271 10.65 4.11096 10.7315 4.18026 10.8281C5.99588 13.0747 9.17213 15.75 13.9999 15.75C18.8278 15.75 22.004 13.0714 23.8196 10.8281C23.8881 10.7295 23.9762 10.6461 24.0783 10.583C24.1805 10.5199 24.2945 10.4785 24.4133 10.4614C24.5321 10.4442 24.6532 10.4517 24.769 10.4834C24.8848 10.5151 24.9928 10.5702 25.0864 10.6454C25.18 10.7207 25.2571 10.8143 25.3129 10.9206C25.3687 11.0269 25.402 11.1435 25.4108 11.2633C25.4196 11.383 25.4037 11.5032 25.364 11.6166C25.3244 11.7299 25.2618 11.8338 25.1803 11.9219C24.5442 12.7134 23.8377 13.4456 23.0693 14.1094L25.2568 17.9375C25.3155 18.0373 25.3539 18.1477 25.3696 18.2625C25.3853 18.3772 25.3781 18.4939 25.3484 18.6058C25.3187 18.7177 25.2671 18.8226 25.1965 18.9144C25.126 19.0062 25.0379 19.0831 24.9374 19.1406Z" fill="currentColor" />
  </svg>
);

const BounceIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" style={{ margin: 0 }}>
    <path d="M14 3.5C18.6944 3.5 22.5 7.30558 22.5 12C22.5 16.6944 18.6944 20.5 14 20.5C9.30558 20.5 5.5 16.6944 5.5 12C5.5 7.30558 9.30558 3.5 14 3.5ZM14 5.25C10.2721 5.25 7.25 8.27208 7.25 12C7.25 15.7279 10.2721 18.75 14 18.75C17.7279 18.75 20.75 15.7279 20.75 12C20.75 8.27208 17.7279 5.25 14 5.25ZM14 7C16.7614 7 19 9.23858 19 12C19 14.7614 16.7614 17 14 17C11.2386 17 9 14.7614 9 12C9 9.23858 11.2386 7 14 7ZM14 8.75C12.2051 8.75 10.75 10.2051 10.75 12C10.75 13.7949 12.2051 15.25 14 15.25C15.7949 15.25 17.25 13.7949 17.25 12C17.25 10.2051 15.7949 8.75 14 8.75ZM14 10.5C14.8284 10.5 15.5 11.1716 15.5 12C15.5 12.8284 14.8284 13.5 14 13.5C13.1716 13.5 12.5 12.8284 12.5 12C12.5 11.1716 13.1716 10.5 14 10.5Z" fill="currentColor" />
  </svg>
);

// Custom placeholder animation icons
const ShimmerIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: 0 }}>
    <path d="M14 2L12 8H6L10 12L8 18L14 14L20 18L18 12L22 8H16L14 2Z" fill="currentColor" />
  </svg>
);

const PulseIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: 0 }}>
    <circle cx="14" cy="14" r="10" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
    <circle cx="14" cy="14" r="6" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const GlowIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: 0 }}>
    <circle cx="14" cy="14" r="8" fill="currentColor" fillOpacity="0.3" />
    <circle cx="14" cy="14" r="4" fill="currentColor" fillOpacity="0.6" />
  </svg>
);

const ShakeIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: 0 }}>
    <path d="M8 10L10 8L12 10L10 12L8 10ZM16 10L18 8L20 10L18 12L16 10ZM8 18L10 16L12 18L10 20L8 18ZM16 18L18 16L20 18L18 20L16 18Z" fill="currentColor" />
  </svg>
);

const SlideIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: 0 }}>
    <path d="M6 14L22 14M14 6L22 14L14 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Sub-components (recreated from Polotno)
const AnimateButtons = observer(({ element, store, enabled }) => {
  const enter = element.animations.find(a => a.type === 'enter');
  const exit = element.animations.find(a => a.type === 'exit');
  
  if (!enabled) return null;
  
  return (
    <div>
      <div style={{ padding: '10px 0px' }}>Animate</div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Button
          fill
          active={enter?.enabled && !exit?.enabled}
          onClick={() => {
            store.history.transaction(() => {
              element.setAnimation('enter', { enabled: true });
              element.setAnimation('exit', { enabled: false });
            });
          }}
        >
          Enter
        </Button>
        <Button
          fill
          active={enter?.enabled && exit?.enabled}
          onClick={() => {
            store.history.transaction(() => {
              element.setAnimation('enter', { enabled: true });
              element.setAnimation('exit', { enabled: true });
            });
          }}
        >
          Both
        </Button>
        <Button
          fill
          active={exit?.enabled && !enter?.enabled}
          onClick={() => {
            store.history.transaction(() => {
              element.setAnimation('enter', { enabled: false });
              element.setAnimation('exit', { enabled: true });
            });
          }}
        >
          Exit
        </Button>
      </div>
    </div>
  );
});

const DirectionSelector = observer(({ value, onChange }) => {
  const directions = ['right', 'left', 'up', 'down', 'bottom-right', 'bottom-left', 'top-right', 'top-left'];
  
  const itemRenderer = (dir, { handleClick, handleFocus, modifiers, query }) => {
    if (!modifiers.matchesPredicate) return null;
    return (
      <MenuItem
        active={modifiers.active}
        disabled={modifiers.disabled}
        key={dir}
        onClick={handleClick}
        icon={`arrow-${dir}`}
        onFocus={handleFocus}
        roleStructure="listoption"
        text={dir}
        shouldDismissPopover={false}
      />
    );
  };
  
  return (
    <div style={{ paddingTop: '10px' }}>
      <div style={{ paddingBottom: '10px' }}>Direction</div>
      <Select
        items={directions}
        itemRenderer={itemRenderer}
        filterable={false}
        activeItem={value}
        onItemSelect={onChange}
      >
        <Button text={value} icon={`arrow-${value}`} fill />
      </Select>
    </div>
  );
});

const ZoomDirectionSelector = observer(({ value, onChange }) => {
  const directions = ['in', 'out'];
  
  const itemRenderer = (dir, { handleClick, handleFocus, modifiers }) => {
    if (!modifiers.matchesPredicate) return null;
    return (
      <MenuItem
        active={modifiers.active}
        disabled={modifiers.disabled}
        key={dir}
        onClick={handleClick}
        onFocus={handleFocus}
        roleStructure="listoption"
        text={dir === 'out' ? 'Zoom Out' : 'Zoom In'}
        shouldDismissPopover={false}
      />
    );
  };
  
  return (
    <div style={{ paddingTop: '10px' }}>
      <div style={{ paddingBottom: '10px' }}>Direction</div>
      <Select
        items={directions}
        itemRenderer={itemRenderer}
        filterable={false}
        activeItem={value}
        onItemSelect={onChange}
      >
        <Button text={value === 'out' ? 'Zoom Out' : 'Zoom In'} fill />
      </Select>
    </div>
  );
});

const DelayControl = observer(({ element, store }) => {
  const enter = element.animations.find(a => a.type === 'enter');
  if (!enter) return null;
  
  const pageDuration = element.page.duration;
  
  return (
    <div style={{ padding: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '5px', paddingBottom: '5px' }}>
        <div>Delay</div>
        <div>
          <NumberInput
            value={parseFloat((enter.delay / 1000).toFixed(2))}
            onValueChange={(val) => {
              element.setAnimation('enter', { delay: val * 1000 });
            }}
            style={{ width: '50px' }}
            minorStepSize={0.01}
            stepSize={0.01}
            min={0}
            max={pageDuration / 1000}
            buttonPosition="none"
          />
        </div>
      </div>
      <Slider
        min={0}
        max={pageDuration}
        value={enter.delay}
        showTrackFill={false}
        labelRenderer={false}
        onChange={(val) => {
          element.setAnimation('enter', { delay: val });
        }}
      />
    </div>
  );
});

const DurationControl = observer(({ element, store }) => {
  const enter = element.animations.find(a => a.type === 'enter');
  if (!enter) return null;
  
  const pageDuration = element.page.duration;
  
  return (
    <div style={{ padding: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '5px', paddingBottom: '5px' }}>
        <div>Duration</div>
        <div>
          <NumberInput
            value={parseFloat((enter.duration / 1000).toFixed(2))}
            onValueChange={(val) => {
              element.setAnimation('enter', { duration: val * 1000 });
              element.setAnimation('exit', { duration: val * 1000 });
            }}
            style={{ width: '50px' }}
            minorStepSize={0.01}
            stepSize={0.01}
            min={0}
            max={pageDuration / 1000}
            buttonPosition="none"
          />
        </div>
      </div>
      <Slider
        min={0}
        max={pageDuration}
        value={enter.duration}
        showTrackFill={false}
        labelRenderer={false}
        onChange={(val) => {
          element.setAnimation('enter', { duration: val });
          element.setAnimation('exit', { duration: val });
        }}
      />
    </div>
  );
});

const StrengthControl = observer(({ element, store, animationName }) => {
  const anim = element.animations.find(a => a.name === animationName && a.enabled);
  if (!anim) return null;
  
  const strength = anim.data?.strength ?? 1;
  let maxStrength = 2;
  if (animationName === 'bounce' || animationName === 'zoom') {
    maxStrength = 2;
  } else if (animationName === 'move') {
    maxStrength = 3;
  }
  
  const updateStrength = (val) => {
    store.history.transaction(() => {
      element.animations.forEach(anim => {
        if (anim.name === animationName) {
          const data = anim.data || {};
          element.setAnimation(anim.type, {
            data: { ...data, strength: val }
          });
        }
      });
    });
    
    const activePage = store.activePage;
    const playPreview = () => {
      let timeout;
      return (...args) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
          if (!store.isPlaying) {
            store.play({ animatedElementsIds: [element.id], currentTime: element.page.startTime });
            setTimeout(() => {
              store.stop();
              if (activePage) store.selectPage(activePage.id);
            }, 1000);
          }
        }, 300);
      };
    };
    playPreview()();
  };
  
  const max = Math.max(3, strength);
  
  return (
    <div style={{ padding: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '5px', paddingBottom: '5px' }}>
        <div>{t('toolbar.strength')}</div>
        <div>
          <NumberInput
            value={parseFloat(strength.toFixed(2))}
            onValueChange={(val) => updateStrength(Math.max(0.1, val))}
            style={{ width: '50px' }}
            minorStepSize={0.05}
            stepSize={0.1}
            min={0.1}
            buttonPosition="none"
          />
        </div>
      </div>
      <Slider
        min={0.1}
        max={maxStrength}
        stepSize={0.05}
        value={strength}
        showTrackFill={false}
        labelRenderer={false}
        onChange={updateStrength}
      />
    </div>
  );
});

const EndDelayControl = observer(({ element, store }) => {
  const exit = element.animations.find(a => a.type === 'exit');
  if (!exit) return null;
  
  const pageDuration = element.page.duration;
  
  return (
    <div style={{ padding: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '5px', paddingBottom: '5px' }}>
        <div>End Delay</div>
        <div>
          <NumberInput
            value={parseFloat((exit.delay / 1000).toFixed(2))}
            onValueChange={(val) => {
              element.setAnimation('exit', { delay: val * 1000 });
            }}
            style={{ width: '50px' }}
            minorStepSize={0.01}
            stepSize={0.01}
            min={0}
            max={pageDuration / 1000}
            buttonPosition="none"
          />
        </div>
      </div>
      <Slider
        min={0}
        max={pageDuration}
        value={exit.delay}
        showTrackFill={false}
        labelRenderer={false}
        onChange={(val) => {
          element.setAnimation('exit', { delay: val });
        }}
      />
    </div>
  );
});

const SpeedControl = observer(({ element, store }) => {
  const loop = element.animations.find(a => a.type === 'loop' && a.enabled);
  if (!loop) return null;
  
  const speed = 500 / loop.duration;
  
  return (
    <div style={{ padding: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '5px', paddingBottom: '5px' }}>
        <div>Speed</div>
        <div>
          <NumberInput
            value={speed}
            onValueChange={(val) => {
              const newSpeed = Math.min(Math.max(0.1, val), 3);
              element.setAnimation('loop', { duration: 500 / newSpeed });
            }}
            style={{ width: '50px' }}
            minorStepSize={0.01}
            stepSize={0.01}
            min={0.1}
            max={3}
            buttonPosition="none"
          />
        </div>
      </div>
      <Slider
        min={0.1}
        max={3}
        stepSize={0.01}
        value={speed}
        showTrackFill={false}
        labelRenderer={false}
        onChange={(val) => {
          element.setAnimation('loop', { duration: 500 / val });
        }}
        onRelease={() => {
          const activePage = store.activePage;
          store.play({ animatedElementsIds: [element.id], currentTime: element.page.startTime });
          setTimeout(() => {
            store.stop();
            if (activePage) store.selectPage(activePage.id);
          }, 1000);
        }}
      />
    </div>
  );
});

// Main Custom Animations Panel Component
export const CustomAnimationsPanel = observer(({ store }) => {
  const selectedElements = store.selectedElements;
  const element = selectedElements[0];
  
  // Track selected elements to close panel when selection changes
  const selectedIds = React.useMemo(() => selectedElements.map(el => el.id).join(','), []);
  const currentIds = selectedElements.map(el => el.id).join(',');
  
  React.useEffect(() => {
    if (selectedIds !== currentIds) {
      store.openSidePanel(store.previousOpenedSidePanel);
    }
  }, [selectedIds, currentIds, store]);
  
  if (!element || !element.animations) {
    return null;
  }
  
  // Helper to check if animation is enabled
  const isAnimationEnabled = (name) => {
    const anims = name 
      ? element.animations.filter(a => a.name === name || a.type === name)
      : element.animations;
    return anims.some(a => a.enabled);
  };
  
  // Apply animation to all selected elements
  const applyAnimation = (name, config) => {
    store.history.transaction(() => {
      selectedElements.forEach(el => {
        el.setAnimation('enter', { name, ...config });
        el.setAnimation('exit', { name, ...config, from: config.to, to: config.from });
      });
    });
    
    if (config.enabled) {
      const activePage = store.activePage;
      store.play({
        animatedElementsIds: selectedElements.map(el => el.id),
        currentTime: element.page.startTime
      });
      setTimeout(() => {
        store.stop();
        if (activePage) store.selectPage(activePage.id);
      }, 1000);
    }
  };
  
  // Apply loop animation
  const applyLoopAnimation = (name, config) => {
    store.history.transaction(() => {
      selectedElements.forEach(el => {
        el.setAnimation('loop', { name, ...config });
      });
    });
    
    if (config.enabled) {
      const activePage = store.activePage;
      store.play({
        animatedElementsIds: selectedElements.map(el => el.id),
        currentTime: element.page.startTime
      });
      setTimeout(() => {
        store.stop();
        if (activePage) store.selectPage(activePage.id);
      }, 1000);
    }
  };
  
  const hasEnterExit = isAnimationEnabled('enter') || isAnimationEnabled('exit');
  const hasAnimations = isAnimationEnabled('move') || isAnimationEnabled('fade') || isAnimationEnabled('zoom');
  const hasEffects = isAnimationEnabled('rotate') || isAnimationEnabled('blink') || isAnimationEnabled('bounce');
  
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto', padding: '0 10px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px' }}>
        <h3 style={{ margin: 0, lineHeight: '30px' }}>{t('sidePanel.animate')}</h3>
        <Button
          minimal
          icon={<Cross />}
          onClick={() => store.openSidePanel(store.previousOpenedSidePanel)}
        />
      </div>
      
      {/* Animations Section */}
      <div style={{ paddingTop: '10px', lineHeight: '35px' }}>
        Animations{' '}
        <Button
          outlined
          style={{ marginLeft: '10px', display: hasAnimations ? 'inline-flex' : 'none' }}
          onClick={() => {
            element.set({ animations: [] });
          }}
        >
          Remove All
        </Button>
      </div>
      
      <div style={{ paddingTop: '25px' }}>
        {/* Animation Buttons Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '5px', paddingBottom: '10px' }}>
          <div>
            <Button
              outlined
              large
              style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
              icon={<MoveIcon />}
              active={isAnimationEnabled('move')}
              fill
              onClick={() => {
                applyAnimation('move', { enabled: !isAnimationEnabled('move') });
              }}
            >
              {t('toolbar.move')}
            </Button>
          </div>
          <div>
            <Button
              outlined
              large
              style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
              icon={<FadeIcon />}
              fill
              active={isAnimationEnabled('fade')}
              onClick={() => {
                applyAnimation('fade', { enabled: !isAnimationEnabled('fade') });
              }}
            >
              {t('toolbar.fade')}
            </Button>
          </div>
          <div>
            <Button
              outlined
              large
              style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
              icon={<ZoomIcon />}
              fill
              active={isAnimationEnabled('zoom')}
              onClick={() => {
                applyAnimation('zoom', { enabled: !isAnimationEnabled('zoom') });
              }}
            >
              {t('toolbar.zoom')}
            </Button>
          </div>
        </div>
        
        {/* Animation Controls */}
        <div style={{ display: hasAnimations ? 'block' : 'none', padding: '10px', backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
          <AnimateButtons element={element} store={store} enabled={hasEnterExit} />
          
          {isAnimationEnabled('move') && (
            <DirectionSelector
              value={element.animations.find(a => a.name === 'move')?.data?.direction || 'right'}
              onChange={(dir) => {
                applyAnimation('move', { data: { direction: dir }, enabled: true });
              }}
            />
          )}
          
          {isAnimationEnabled('move') && (
            <StrengthControl element={element} store={store} animationName="move" />
          )}
          
          {isAnimationEnabled('zoom') && (
            <ZoomDirectionSelector
              value={element.animations.find(a => a.name === 'zoom')?.data?.direction || 'in'}
              onChange={(dir) => {
                applyAnimation('zoom', { data: { direction: dir }, enabled: true });
              }}
            />
          )}
          
          {isAnimationEnabled('zoom') && (
            <StrengthControl element={element} store={store} animationName="zoom" />
          )}
          
          {hasEnterExit && <DelayControl element={element} store={store} />}
          {hasEnterExit && <DurationControl element={element} store={store} />}
          {isAnimationEnabled('exit') && <EndDelayControl element={element} store={store} />}
        </div>
      </div>
      
      {/* Effects Section */}
      <div style={{ paddingTop: '10px', lineHeight: '35px' }}>
        Effects{' '}
        <Button
          outlined
          style={{ marginLeft: '10px', display: hasEffects ? 'inline-flex' : 'none' }}
          onClick={() => {
            element.set({ animations: [] });
          }}
        >
          Remove All
        </Button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '5px', paddingTop: '10px' }}>
        <div>
          <Button
            minimal
            outlined
            large
            fill
            style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
            icon={<RotateIcon />}
            active={isAnimationEnabled('rotate')}
            onClick={() => {
              applyLoopAnimation('rotate', { enabled: !isAnimationEnabled('rotate') });
            }}
          >
            {t('toolbar.rotate')}
          </Button>
        </div>
        <div>
          <Button
            outlined
            large
            style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
            fill
            icon={<BlinkIcon />}
            active={isAnimationEnabled('blink')}
            onClick={() => {
              applyLoopAnimation('blink', { enabled: !isAnimationEnabled('blink') });
            }}
          >
            {t('toolbar.blink')}
          </Button>
        </div>
        <div>
          <Button
            minimal
            outlined
            large
            style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
            icon={<BounceIcon />}
            fill
            active={isAnimationEnabled('bounce')}
            onClick={() => {
              applyLoopAnimation('bounce', { enabled: !isAnimationEnabled('bounce') });
            }}
          >
            {t('toolbar.bounce')}
          </Button>
        </div>
      </div>
      
      {hasEffects && <SpeedControl element={element} store={store} />}
      {isAnimationEnabled('bounce') && <StrengthControl element={element} store={store} animationName="bounce" />}
      
      {/* CUSTOM PLACEHOLDER ANIMATIONS */}
      <div style={{ paddingTop: '30px', paddingBottom: '10px', borderTop: '2px solid rgba(0, 0, 0, 0.1)', marginTop: '20px' }}>
        <div style={{ paddingBottom: '10px', lineHeight: '35px', fontWeight: 600, color: '#666' }}>
          Coming Soon
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '5px' }}>
          {[
            { name: 'shimmer', label: 'Shimmer', icon: <ShimmerIcon /> },
            { name: 'pulse', label: 'Pulse', icon: <PulseIcon /> },
            { name: 'glow', label: 'Glow', icon: <GlowIcon /> },
            { name: 'shake', label: 'Shake', icon: <ShakeIcon /> },
            { name: 'slide', label: 'Slide', icon: <SlideIcon /> },
          ].map((anim) => (
            <div key={anim.name}>
              <Button
                outlined
                large
                disabled
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: 0.6,
                  cursor: 'not-allowed',
                  position: 'relative',
                }}
                icon={anim.icon}
                fill
                onClick={() => {
                  alert(`${anim.label} animation is coming soon!`);
                }}
              >
                {anim.label}
                <div
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    fontSize: '8px',
                    color: '#999',
                    background: '#fff',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    border: '1px solid #ddd',
                  }}
                >
                  Soon
                </div>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

