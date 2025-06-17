const normalizeToArray = <T,>(data: T | T[] | null | undefined): T[] | null => {
  if (data === null || data === undefined) {
    return null;
  }
  if (Array.isArray(data)) {
    return data.length > 0 ? data : null;
  }
  return [data];
};

export { normalizeToArray }; 