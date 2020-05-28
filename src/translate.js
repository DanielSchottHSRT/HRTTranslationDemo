const LanguageTranslatorV3 = require('ibm-watson/language-translator/v3');
const { IamAuthenticator } = require('ibm-watson/auth');


/**
 * Helper
 * @param {*} errorMessage
 * @param {*} defaultLanguage
 */
function getTheErrorResponse(errorMessage, defaultLanguage) {
  return {
    statusCode: 400,
    body: {
      language: defaultLanguage || 'en',
      errorMessage: errorMessage
    }
  };
}

/**
  *
  * main() will be run when teh action is invoked
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
function main(params) {
  params.text = params.body.text;
  params.target = params.body.target;
  params.source = params.body.language;

  console.log("PARAMS val", params);
  /*
   * The default language to choose in case of an error
   */
  const defaultLanguage = 'en';

  return new Promise(function (resolve, reject) {

    try {

      // initialize translator
      const languageTranslator = new LanguageTranslatorV3({
      version: '2020-05-28',
      authenticator: new IamAuthenticator(
        {
        apikey: 'TfiQUOb1OlGgkOaMQ0WoosEtGNqlY5VO7YDru7mu6mnp',
        }),
        url: 'https://api.eu-de.language-translator.watson.cloud.ibm.com/instances/b0a93c4f-3526-4928-88bc-e0c5aec5c620',
      });

      // needed params present
      if ((typeof params.text === 'string' || params.text instanceof String) && params.source && params.target ){

        // translate text
        languageTranslator.translate(params).then(translationResult => {
          console.log("translationResult",JSON.stringify(translationResult, null, 2));

          resolve({
            statusCode: 200,
            body: {
              translations: translationResult.translations,
              words: translationResult.word_count,
              characters: translationResult.character_out,
            },
            headers: { 'Content-Type': 'application/json' }
          });

        }).catch(err => {
          console.error('Error while initializing the AI service', err);
          resolve(getTheErrorResponse('Error while communicating with the language service', defaultLanguage));
        });
      }
    } catch (err) {
      console.error('Error while initializing the AI service', err);
      resolve(getTheErrorResponse('Error while communicating with the language service', defaultLanguage));
    }
  });
}
