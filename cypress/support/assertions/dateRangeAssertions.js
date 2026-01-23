export const assertAllInRangeYMD = (items, fieldName, startDate, endDate) => {
  expect(items, 'items should be an array').to.be.an('array');

  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T23:59:59Z`);

  items.forEach((item, i) => {
    const raw = item[fieldName];
    expect(raw, `item[${i}].${fieldName} should exist`).to.exist;

    const d = new Date(`${raw}T00:00:00Z`);
    expect(d.toString(), `item[${i}].${fieldName} should be a valid date`)
      .to.not.eq('Invalid Date');

    expect(d.getTime(), `item[${i}].${fieldName} >= ${startDate}`)
      .to.be.at.least(start.getTime());

    expect(d.getTime(), `item[${i}].${fieldName} <= ${endDate}`)
      .to.be.at.most(end.getTime());
  });
};