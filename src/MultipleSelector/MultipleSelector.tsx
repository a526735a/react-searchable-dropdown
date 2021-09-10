/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, {
  useState, useCallback, useRef, useEffect,
} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Tooltip from '@material-ui/core/Tooltip';
import { ChoiceSections, Choice } from './MultipleSectionItem';
import MultipleSelectorPopup from './MultipleSelectorPopup';

const useStyles = makeStyles({
  selectDiv: {
    alignItems: 'center',
    flex: 1,
    display: 'flex',
    border: '1px solid #E6E6E6',
    borderRadius: '4px',
    width: '170px',
    height: '35px',
    position: 'relative',
    padding: '0px 15px',
    '&:hover': {
      border: '1px solid #919191 !important',
    },
    backgroundColor: 'white',
    outline: 'none !important',
    outlineOffset: 'none !important',
  },
  disabled: {
    pointerEvents: 'none',
    background: '#E6E6E6',
    border: '1px solid #424242 important',
    '& svg': {
      color: '#828282',
    },
    '& p': {
      opacity: 0.35,
    },
  },
  openSelect: {
    border: '1px solid #919191 !important',
  },
  textContainer: {
    width: '100%',
    display: 'flex',
    overflow: 'hidden',
  },
  label: {
    display: 'flex',
    maxWidth: '100%',
    minWidth: '100%',
    width: '0px',
  },
  expandIcon: {
    display: 'flex',
    padding: '1px',
    right: '0',
    marginLeft: 'auto',
  },
  errorDiv: {
    border: '1px solid #D64646 !important',
  },
  groupTag: {
    color: '#63B178',
    whiteSpace: 'pre',
    fontStyle: 'italic',
  },
  placeholder: {
    whiteSpace: 'nowrap',
    color: '#919191',
    opacity: 0.75,
    fontStyle: 'italic',
    fontWeight: 400,
    overflow: 'hidden',
  },
});

export interface Props {
  label: string;
  popUpKey: string;
  choiceSections: ChoiceSections[];
  selectDivPropsStyle?: { [key:string]: any};
  name?: string;
  error?: boolean;
  placeholder?: string;
  disable?:boolean;
  checkedChoice?: Choice[];
  id?: string;
  style?: { [key:string]: any};
  className?: any,
  itemHeight?: number;
  scrollDivHeight?: number;
  handleSelect: ({ value, name }: { value: any, name: string }) => void;
}

const MultipleSelector: React.FC<Props> = ({
  label,
  name,
  popUpKey,
  error,
  choiceSections,
  placeholder,
  selectDivPropsStyle,
  disable,
  checkedChoice,
  id,
  className,
  style,
  itemHeight,
  scrollDivHeight,
  handleSelect,
}) => {
  const classes = useStyles();
  const [open, setOpen] = useState<boolean>(false);
  const [chosenChoice, setChosenChoice] = useState<{[key: string]: Choice | null}>({});
  const [mulChoiceSections, setMulChoiceSections] = useState<ChoiceSections[]>([...choiceSections]);
  const selectFieldRef = useRef<HTMLDivElement>(null);

  const handleClosePopup = useCallback((submitChoices: {[key: string]: Choice | null}) => {
    setOpen(false);
    if (submitChoices) {
      let selectedChoice = Object.keys(submitChoices).reduce((acc, choiceLabel) => (
        submitChoices[choiceLabel] ? [...acc, submitChoices[choiceLabel]] : acc), [])
        .sort((a, b) => Number(b?.isGroup) - Number(a?.isGroup));
      // handle if previously user select single choice (example: 'All Dealers')
      // and user not selecting new choices
      if (Object.keys(submitChoices).length === 0
        && checkedChoice
        && checkedChoice[0]
        && checkedChoice[0].singleChoice) {
        selectedChoice = [checkedChoice[0]];
      }
      handleSelect({ value: selectedChoice, name: name ?? '' });
    }
  }, [checkedChoice, handleSelect, name]);

  const handleSelectChoice = (value: Choice, isCheck: boolean) => {
    setChosenChoice({ ...chosenChoice, [`${value.isGroup ? 'Group -' : ''}${value.id ?? value.label}`]: (isCheck || value.singleChoice) ? value : null });
    if (value.singleChoice) {
      handleClosePopup({ [`${value.singleChoice ? 'Single -' : ''}${value.isGroup ? 'Group -' : ''}${value.id ?? value.label}`]: (isCheck || value.singleChoice) ? value : null });
    }
  };

  const handleClearAll = () => {
    setChosenChoice({});
  };

  useEffect(() => {
    const initChosenChoice: { [key: string]: Choice } = {};
    if (checkedChoice && checkedChoice[0] && !checkedChoice[0].singleChoice) {
      checkedChoice.forEach((choice) => {
        if (choice.label.trim().length > 0) {
          initChosenChoice[`${choice.singleChoice ? 'Single -' : ''}${choice.isGroup ? 'Group -' : ''}${choice.id ?? choice.label}`] = choice;
        }
      });
    }
    setChosenChoice(initChosenChoice);
    setMulChoiceSections(choiceSections.map((section) => ({
      ...section, choices: section.choices.map((choice) => ({ ...choice, checked: Boolean(initChosenChoice[`${choice.singleChoice ? 'Single -' : ''}${choice.isGroup ? 'Group -' : ''}${choice.id ?? choice.label}`]) })),
    })));
  }, [checkedChoice, choiceSections]);

  return (
    <div ref={selectFieldRef} style={{ width: '100%', display: 'flex', ...style }}>
      <Tooltip
        title={checkedChoice ? checkedChoice?.map((choice) => choice.label).join(', ') : ''}
        placement="top"
      >
        <button
          type="button"
          className={`
          ${classes.selectDiv}
          ${open ? classes.openSelect : ''}
          ${error ? classes.errorDiv : ''}
          ${disable ? classes.disabled : ''}
          ${className}
        `}
          style={selectDivPropsStyle}
          onClick={() => setOpen(true)}
          id={`${id}-multiple-selector-button`}
        >
          {!disable && (
          <div className={classes.textContainer}>
            {(label === undefined || label.length === 0)
              ? (
                <Typography variant="body1" className={classes.placeholder}>
                  {placeholder}
                </Typography>
              )
              : (
                <>
                  {checkedChoice && checkedChoice[0]?.isGroup && (
                  <Typography className={classes.groupTag}>
                    {'Group: '}
                  </Typography>
                  )}
                  <Typography variant="body1" className={classes.label} noWrap>
                    {label}
                  </Typography>
                </>
              )}
          </div>
          )}
          <div className={classes.expandIcon}>
            <ExpandMoreIcon style={{ fontSize: '15px' }} />
          </div>
        </button>
      </Tooltip>
      {open && selectFieldRef.current &&  (
        <MultipleSelectorPopup
          choiceSections={mulChoiceSections}
          anchorEl={selectFieldRef.current}
          popUpKey={popUpKey}
          name={name ?? ''}
          chosenChoice={chosenChoice}
          id={id}
          itemHeight={itemHeight}
          scrollDivHeight={scrollDivHeight}
          handleSelect={handleSelectChoice}
          handleClose={handleClosePopup}
          handleClearAll={handleClearAll}
        />
      )}
    </div>
  );
};

export type { ChoiceSections, Choice };
export default MultipleSelector;
