import { useEffect, useRef } from 'react';

function usePrevious<T>(value: T): T | undefined {
  // We use a generic type T for the ref to match the input type
  const ref = useRef<T>(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

export default usePrevious;