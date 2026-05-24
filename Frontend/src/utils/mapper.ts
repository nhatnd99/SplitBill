export const mapMongoId = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(mapMongoId);
  }
  if (data !== null && typeof data === 'object') {
    const mapped: any = {};
    for (const key in data) {
      if (key === '_id') {
        mapped['id'] = data[key];
      } else {
        mapped[key] = mapMongoId(data[key]);
      }
    }
    return mapped;
  }
  return data;
};
