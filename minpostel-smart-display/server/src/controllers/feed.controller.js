import { sendSuccess, sendError } from '../utils/response.util.js';

export const getFeeds = async (req, res) => {
  try {
    const mockFeeds = [
      { id: 1, text_fr: "Cameroun : Le MINPOSTEL lance la campagne nationale de cybersécurité 2026.", text_en: "Cameroon: MINPOSTEL launches the 2026 national cybersecurity campaign." },
      { id: 2, text_fr: "Inauguration du nouveau centre de données gouvernemental à Yaoundé.", text_en: "Inauguration of the new government data center in Yaoundé." },
      { id: 3, text_fr: "Le Ministre présidera la conférence sur l'économie numérique ce jeudi.", text_en: "The Minister will chair the digital economy conference this Thursday." },
      { id: 4, text_fr: "Déploiement de la 5G : Les opérateurs télécoms s'engagent pour une couverture nationale.", text_en: "5G Deployment: Telecom operators commit to national coverage." }
    ];
    return sendSuccess(res, 'Feeds retrieved successfully', mockFeeds);
  } catch (err) {
    return sendError(res, err.message);
  }
};
