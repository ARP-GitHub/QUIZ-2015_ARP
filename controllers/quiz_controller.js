var models = require('../models/models.js');

var temas = [
		 {value: 'Otro', text: 'Otro'},
                 {value: 'Humanidades', text: 'Humanidades'},
                 {value: 'Ocio', text: 'Ocio'},
                 {value: 'Ciencia', text: 'Ciencia'},
                 {value: 'Tecnología', text: 'Tecnología'}
	       ];

// Autoload :id
exports.load = function(req, res, next, quizId) {
   models.Quiz.findById(quizId).then(
      function(quiz) {
         if (quiz) {
            req.quiz = quiz;
            next();
         } 
         else {
	    next(new Error('No existe quizId=' + quizId));
         }
      }
   ).catch(function(error) { next(error)});
};


// GET /quizes/
exports.index = function(req, res, next) {
   var busqueda = req.query.search;
   // Por defecto se muestran todas las preguntas al dar a preguntas
   // Se ordena por orden ascendente (ASC)
   // Nota: las minúsculas van después que las mayúsculas; así bbb irá después de CCC
   if (!!busqueda) {
	busqueda = '%' + busqueda + '%'; //Añade al principio y al final los %
	busqueda = busqueda.toLowerCase().trim();
	//busqueda = busqueda.replace(' ','%');
	busqueda = busqueda.replace(/\s/g,'%'); //reemplaza los espacios por %
   }
   models.Quiz.findAll((busqueda) ? {where: ["lower(pregunta) like ?", busqueda], order:"pregunta ASC"} : {order:"pregunta ASC"}).then(
	function(quizes) {
	    res.render('quizes/index.ejs', { quizes: quizes, errors: []});
        }
   ).catch(function(error){next(error)});
};

// Otra forma
//      if (!!busqueda) {
//	 busqueda = '%' + busqueda + '%';
//	 busqueda = busqueda.toLowerCase().trim();
//	 busqueda = busqueda.replace(/\s/g,'%');
//	 models.Quiz.findAll({where: ["lower(pregunta) like ?", busqueda], order:"pregunta ASC"}).then(
//	     function(quizes) {
// 		res.render('quizes/index.ejs', { quizes: quizes, errors: []});
//             }
//   	 ).catch(function(error) { next(error);});
//      }
//      else {
//	  models.Quiz.findAll({order:"pregunta ASC"}).then(
//	     function(quizes) {
//	       res.render('quizes/index.ejs', { quizes: quizes, errors: []});
//           }
//        ).catch(function(error) { next(error);});
//     }
//};


// GET /quizes/:id
exports.show = function(req, res) {
    	res.render('quizes/show', { quiz: req.quiz, errors: []});
};      	  // req.quiz: instancia de quiz cargada con autoload


// GET /quizes/:id/answer
exports.answer = function(req, res) {
      var resultado = 'Incorrecto';
      // En la respuesta se admite mayúsculas/minúsculas indistintamente
      // Se eliminan espacios inicial y final si hubiera
      // Se han de introducir los acentos correctos! (idioma español)
      // req.query.respuesta es la respuesta introducida desde el formulario
      // req.quiz.respuesta es la respuesta en la BD
      var patt = new RegExp('^' + req.quiz.respuesta + '$', 'i');
      if (patt.exec(req.query.respuesta.trim())) {
          resultado = 'Correcto'; 
      }
      res.render('quizes/answer',
		 {quiz: req.quiz, respuesta: resultado, errors: []}
      );
};


// Controladores new y create para crear preguntas

// GET /quizes/new
exports.new = function(req, res) {
  // Creamos un objeto nuevo quiz que luego modificamos
  var quiz = models.Quiz.build(
    {pregunta: "Pregunta", respuesta: "Respuesta", tema: "Tema"}
  );
  res.render('quizes/new', {quiz: quiz, temas: temas, errors: []});
};


// POST /quizes/create
exports.create = function(req, res) {
  // Creamos un objeto nuevo con los datos del formulario
  var quiz = models.Quiz.build( req.body.quiz );
  quiz.validate().then(
    function(err){
      if (err) {
        res.render('quizes/new', {quiz: quiz, errors: err.errors});
      } else {
	// save: guarda en DB campos pregunta y respuesta de quiz
        quiz
	.save({fields: ["pregunta", "respuesta", "tema"]})
	.then( function(){ res.redirect('/quizes')}) 
      }      // res.redirect: Redirección HTTP (URL relativo) a lista de preguntas
    }
  ).catch(function(error){next(error)});
};


// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz;  // req.quiz: autoload de instancia de quiz

  res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
  req.quiz.pregunta  = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;
  req.quiz.tema = req.body.quiz.tema;
  req.quiz.validate().then(
    function(err){
      if (err) {
        res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
      } else {
        req.quiz     // save: guarda campos pregunta y respuesta en DB
        .save( {fields: ["pregunta", "respuesta", "tema"]})
        .then( function(){ res.redirect('/quizes');});
      }     // Redirección HTTP a lista de preguntas (URL relativo)
    }
  ).catch(function(error){next(error)});
};


// DELETE /quizes/:id
exports.destroy = function(req, res) {
  req.quiz.destroy().then( function() {res.redirect('/quizes');}
  ).catch(function(error){next(error)});
};

//  console.log("req.quiz.id: " + req.quiz.id);