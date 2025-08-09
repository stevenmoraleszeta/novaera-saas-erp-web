// services/companyService.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const registerCompany = async (companyData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/companies/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(companyData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al registrar empresa');
    }

    return data;
  } catch (error) {
    console.error('Error registrando empresa:', error);
    throw error;
  }
};

export const validateCompanyCode = async (companyCode) => {
  try {
    const response = await fetch(`${API_BASE_URL}/companies/validate-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: companyCode }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Código de empresa inválido');
    }

    return data;
  } catch (error) {
    console.error('Error validando código de empresa:', error);
    throw error;
  }
};

export const getCompanyInfo = async (companyId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error obteniendo información de empresa');
    }

    return data;
  } catch (error) {
    console.error('Error obteniendo empresa:', error);
    throw error;
  }
};
