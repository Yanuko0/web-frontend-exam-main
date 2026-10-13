import { useEffect, useState } from 'react';
import { fetchEducationLevels, fetchSalaryLevels } from '../api';

export default function useOptions() {
  const [educationLevels, setEducationLevels] = useState([]);
  const [salaryLevels, setSalaryLevels] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    fetchEducationLevels(controller.signal).then(setEducationLevels).catch(() => {});
    fetchSalaryLevels(controller.signal).then(setSalaryLevels).catch(() => {});
    return () => controller.abort();
  }, []);

  return { educationLevels, salaryLevels };
}
