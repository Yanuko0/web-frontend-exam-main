import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useI18n } from '../i18n';

const optionShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
});

function SelectField({
  label, value, options, onChange,
}) {
  const { t } = useI18n();
  return (
    <TextField
      select
      size="small"
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      InputLabelProps={{ shrink: true }}
      SelectProps={{ displayEmpty: true }}
      sx={{ minWidth: 0 }}
    >
      <MenuItem value="">{t('filter.any')}</MenuItem>
      {options.map((option) => (
        <MenuItem key={option.id} value={option.id}>{option.label}</MenuItem>
      ))}
    </TextField>
  );
}

SelectField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(optionShape).isRequired,
  onChange: PropTypes.func.isRequired,
};

function FilterBar({
  educationLevels, salaryLevels, initialFilters, onSearch,
}) {
  const [companyName, setCompanyName] = useState(initialFilters.companyName);
  const [educationLevel, setEducationLevel] = useState(initialFilters.educationLevel);
  const [salaryLevel, setSalaryLevel] = useState(initialFilters.salaryLevel);
  const { t } = useI18n();
  const dirty = Boolean(companyName || educationLevel || salaryLevel);

  const handleReset = () => {
    setCompanyName('');
    setEducationLevel('');
    setSalaryLevel('');
    onSearch({ companyName: '', educationLevel: '', salaryLevel: '' });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch({ companyName: companyName.trim(), educationLevel, salaryLevel });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 180px 220px auto',
        gap: 1.5,
        alignItems: 'start',
        mb: 2,
      }}
    >
      <TextField
        size="small"
        label={t('filter.company')}
        placeholder={t('filter.companyPlaceholder')}
        value={companyName}
        onChange={(event) => setCompanyName(event.target.value)}
        InputLabelProps={{ shrink: true }}
      />
      <SelectField
        label={t('filter.education')}
        value={educationLevel}
        options={educationLevels}
        onChange={setEducationLevel}
      />
      <SelectField
        label={t('filter.salary')}
        value={salaryLevel}
        options={salaryLevels}
        onChange={setSalaryLevel}
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          type="submit"
          variant="contained"
          disableElevation
          sx={{ height: 40, px: 3, whiteSpace: 'nowrap' }}
        >
          {t('filter.search')}
        </Button>
        {dirty && (
          <Button
            type="button"
            color="inherit"
            onClick={handleReset}
            sx={{ height: 40, color: 'text.secondary', whiteSpace: 'nowrap' }}
          >
            {t('filter.clear')}
          </Button>
        )}
      </Box>
    </Box>
  );
}

FilterBar.propTypes = {
  educationLevels: PropTypes.arrayOf(optionShape).isRequired,
  salaryLevels: PropTypes.arrayOf(optionShape).isRequired,
  initialFilters: PropTypes.shape({
    companyName: PropTypes.string,
    educationLevel: PropTypes.string,
    salaryLevel: PropTypes.string,
  }),
  onSearch: PropTypes.func.isRequired,
};

FilterBar.defaultProps = {
  initialFilters: { companyName: '', educationLevel: '', salaryLevel: '' },
};

export default memo(FilterBar);
