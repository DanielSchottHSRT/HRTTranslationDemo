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
  * main() will be run when the action is invoked
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
function main(params) {
  params.text = "this is a text";
  params.target = 'de';

  console.log("PARAMS detect val", params);
  /*
   * The default language to choose in case of an error
   */
  const defaultLanguage = 'en';

  var highestConfidenceScore = 0.0;
  var languageWithHighestScore ='';

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

      // text to translate present
      if (typeof params.text === 'string' || params.text instanceof String) {

        console.log("text is string");
        // identify language of translateable text
        languageTranslator.identify(params).then(identifiedLanguages => {

          console.log("LANGUAGES : ",JSON.stringify(identifiedLanguages, null, 2));

          // search langueage with highes confidence score
          console.log("result", identifiedLanguages.result.languages);

          identifiedLanguages.result.languages.forEach(language => {
              if(language.confidence > highestConfidenceScore){
                highestConfidenceScore = language.confidence;
                languageWithHighestScore = language.language;
              }
          });

          resolve({
            statusCode: 200,
            body: {
              text:params.text,
              target: params.target,
              language: languageWithHighestScore,
              confidence: highestConfidenceScore,
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
