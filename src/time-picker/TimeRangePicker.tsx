import React, { FC, useState, useEffect } from 'react';
import classNames from 'classnames';

import { TimeIcon } from 'tdesign-icons-react';
import noop from '../_util/noop';
import useDefaultValue from '../_util/useDefaultValue';
import useConfig from '../_util/useConfig';
import { RangeInputPopup, RangeInputPosition } from '../range-input';
import TimePickerPanel from './panel/TimePickerPanel';

import { useTimePickerTextConfig } from './hooks/useTimePickerTextConfig';
import { formatInputValue, validateInputValue } from '../_common/js/time-picker/utils';

import { TdTimeRangePickerProps, TimeRangeValue, TimeRangePickerPartial } from './type';
import { StyledProps } from '../common';

export interface TimeRangePickerProps extends TdTimeRangePickerProps, StyledProps {}

const defaultArrVal = [undefined, undefined];

const TimeRangePicker: FC<TimeRangePickerProps> = (props) => {
  const TEXT_CONFIG = useTimePickerTextConfig();

  const {
    allowInput,
    clearable,
    disabled,
    format = 'HH:mm:ss',
    hideDisabledTime = true,
    placeholder = TEXT_CONFIG.rangePlaceholder,
    size = 'medium',
    steps = [1, 1, 1],
    value = defaultArrVal,
    disableTime,
    onChange,
    onBlur = noop,
    onFocus = noop,
    onInput = noop,
    style,
    className,
  } = useDefaultValue(props);

  const { classPrefix } = useConfig();
  const [isPanelShowed, setPanelShow] = useState(false);
  const [currentPanelIdx, setCurrentPanelIdx] = useState(0);
  const [currentValue, setCurrentValue] = useState(['', '']);

  const name = `${classPrefix}-time-picker`;

  const inputClasses = classNames(`${name}__group`, {
    [`${classPrefix}-is-focused`]: isPanelShowed,
  });

  const handleShowPopup = (visible: boolean) => {
    setPanelShow(visible);
  };

  const handleClear = (context: { e: React.MouseEvent }) => {
    const { e } = context;
    e.stopPropagation();
    onChange(undefined);
  };

  const handleClick = ({ position }: { position: 'first' | 'second' }) => {
    setCurrentPanelIdx(position === 'first' ? 0 : 1);
  };

  const handleTimeChange = (newValue: string) => {
    if (currentPanelIdx === 0) {
      setCurrentValue([newValue, currentValue[1] ?? newValue]);
    } else {
      setCurrentValue([currentValue[0] ?? newValue, newValue]);
    }
  };

  const handleInputBlur = (value: TimeRangeValue, { e }: { e: React.FocusEvent<HTMLInputElement> }) => {
    if (allowInput) {
      const isValidTime = validateInputValue(currentValue[currentPanelIdx], format);
      if (isValidTime) {
        const formattedVal = formatInputValue(currentValue[currentPanelIdx], format);
        currentPanelIdx === 0
          ? setCurrentValue([formattedVal, currentValue[1] ?? formattedVal])
          : setCurrentValue([currentValue[0] ?? formattedVal, formattedVal]);
      }
    }
    onBlur({ value, e });
  };

  const handleInputChange = (
    inputVal: TimeRangeValue,
    { e, position }: { e: React.FocusEvent<HTMLInputElement>; position: RangeInputPosition },
  ) => {
    setCurrentValue(inputVal);
    onInput({ value, e, position: position as TimeRangePickerPartial });
  };

  const handleClickConfirm = () => {
    const isValidTime = !currentValue.find((v) => !validateInputValue(v, format));
    if (isValidTime) onChange(currentValue);
    setPanelShow(false);
  };

  const handleFocus = (
    value: TimeRangeValue,
    { e, position }: { e: React.FocusEvent<HTMLInputElement>; position: RangeInputPosition },
  ) => {
    onFocus({ value, e, position: position as TimeRangePickerPartial });
  };

  useEffect(() => {
    setCurrentValue(isPanelShowed ? value ?? defaultArrVal : defaultArrVal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPanelShowed]);

  return (
    <div className={classNames(name, className)} style={style}>
      <RangeInputPopup
        style={style}
        disabled={disabled}
        popupVisible={isPanelShowed}
        onPopupVisibleChange={handleShowPopup}
        popupProps={{
          overlayStyle: {
            width: '280px',
          },
          ...props.popupProps,
        }}
        onInputChange={handleInputChange}
        inputValue={isPanelShowed ? currentValue : value ?? defaultArrVal}
        rangeInputProps={{
          size,
          clearable,
          className: inputClasses,
          value: isPanelShowed ? currentValue : value ?? undefined,
          placeholder,
          suffixIcon: <TimeIcon />,
          onClear: handleClear,
          onClick: handleClick,
          onFocus: handleFocus,
          onBlur: handleInputBlur,
          readonly: !allowInput,
          ...props.rangeInputProps,
        }}
        panel={
          <TimePickerPanel
            steps={steps}
            format={format}
            disableTime={disableTime}
            hideDisabledTime={hideDisabledTime}
            isFooterDisplay={true}
            value={currentValue[currentPanelIdx || 0]}
            onChange={handleTimeChange}
            handleConfirmClick={handleClickConfirm}
            position={currentPanelIdx === 0 ? 'start' : 'end'}
          />
        }
      />
    </div>
  );
};

TimeRangePicker.displayName = 'TimeRangePicker';

export default TimeRangePicker;
