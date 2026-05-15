import db from './db.js';

const getAllOrganizations = async () => {
  const query = `
    SELECT organization_id, name, description, contact_email, logo_filename
    FROM public.organization;
  `;
  const result = await db.query(query);
  return result.rows;
};

const getOrganizationDetails = async (organizationId) => {
  const query = `
    SELECT
      organization_id,
      name,
      description,
      contact_email,
      logo_filename
    FROM public.organization
    WHERE organization_id = $1;
  `;
  const result = await db.query(query, [organizationId]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

const createOrganization = async (name, description, contactEmail, logoFilename) => {
  const query = `
    INSERT INTO organization (name, description, contact_email, logo_filename)
    VALUES ($1, $2, $3, $4)
    RETURNING organization_id
  `;
  const queryParams = [name, description, contactEmail, logoFilename];
  const result = await db.query(query, queryParams);

  if (result.rows.length === 0) {
    throw new Error('Failed to create organization');
  }

  if (process.env.ENABLE_SQL_LOGGING === 'true') {
    console.log('Created new organization with ID:', result.rows[0].organization_id);
  }

  return result.rows[0].organization_id;
};

const updateOrganization = async (id, name, description, contactEmail, logoFilename) => {
  const query = `
    UPDATE organization
    SET name = $2,
        description = $3,
        contact_email = $4,
        logo_filename = $5
    WHERE organization_id = $1
    RETURNING organization_id;
  `;
  const params = [id, name, description, contactEmail, logoFilename];
  const result = await db.query(query, params);

  if (result.rows.length === 0) {
    throw new Error('Failed to update organization');
  }

  return result.rows[0].organization_id;
};

export { getAllOrganizations, getOrganizationDetails, createOrganization, updateOrganization };