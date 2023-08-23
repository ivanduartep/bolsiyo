export const convertDateStringToMySQLDateTime = (dateTime: string): string => {
  return new Date(dateTime).toISOString().slice(0, 19).replace('T', ' ');
};
