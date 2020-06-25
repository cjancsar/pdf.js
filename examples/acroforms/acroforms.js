/* Copyright 2017 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "../../node_modules/pdfjs-dist/build/pdf.worker.js";

var DEFAULT_URL = "../../test/pdfs/fw4.pdf";
var DEFAULT_SCALE = 1.0;

var container = document.getElementById("pageContainer");

var eventBus = new pdfjsViewer.EventBus();

/**
 * TODO - Identify form input fields
 * TODO - Be able to enable / disable form input fields based on field map
 * TODO - Script support for form input fields (i.e. summation)
 * TODO - Script validation support (ng-validate?)
 * TODO - Insert Text into PDF form fields on load
 * TODO - Get form data FROM Acroform into console as object
 * TODO - "Flatten" PDF (merge data into pdf document)
 * TODO - On client convert flattened PDF to base64 for streaming to server
 */

const SUPPORTED_FORM_FIELD_TYPES = {
  // TODO support for text, radio buttons, signatures? dates, checkboxes, select boxes (with values)

  TEXT: 'Tx'
};

const SUPPORTED_DATA_TYPES = {
  TEXT: 'TEXT'
};

/**
 * A map of all (necessary) Acroform fields (by unique field name) mapped to their internal property name,
 * expected field type, expected data type, etc.
 * Field `names` not specified in this map will be disabled as inputs
 *
 * @todo disable fields by name if not on this list
 */
const DOCUMENT_ACROFORM_FIELD_MAP = new Map([
  ['topmostSubform[0].Page1[0].Step1a[0].f1_01[0]', {
    key: 'firstNameWithMiddleInitial',
    fieldType: SUPPORTED_FORM_FIELD_TYPES.TEXT,
    dataType: SUPPORTED_DATA_TYPES.TEXT,
    // TODO handle case where field not found or value empty, etc.
    value: () => (document.getElementsByName("topmostSubform[0].Page1[0].Step1a[0].f1_01[0]")[0].value)
  }]
]);

(async () => {
  // Fetch the PDF document from the URL using promises.
  const docRoot = await pdfjsLib.getDocument(DEFAULT_URL)
  const doc = await docRoot.promise;

  for (var pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const pdfPage = await doc.getPage(pageNum)

    var pdfPageView = new pdfjsViewer.PDFPageView({
      container: container,
      id: pageNum,
      scale: DEFAULT_SCALE,
      defaultViewport: pdfPage.getViewport({ scale: DEFAULT_SCALE }),
      eventBus: eventBus,
      annotationLayerFactory: new pdfjsViewer.DefaultAnnotationLayerFactory(),
      renderInteractiveForms: true,
    });

    // Associate the actual page with the view and draw it.
    console.log(await _getSupportedAnnotations(pdfPage))

    pdfPageView.setPdfPage(pdfPage);
    pdfPageView.draw();
  }
})()


/**
 * Returns the _supported_ (from `SUPPORTED_FORM_FIELD_TYPES`) form annotation properties.
 * @param {PDFPageProxy} pdfPage
 */
async function _getSupportedAnnotations(pdfPage) {
  let annotations = await pdfPage.getAnnotations()
  return annotations.filter(a => a.fieldType === SUPPORTED_FORM_FIELD_TYPES.TEXT).map(a => ({fieldType: a.fieldType, fieldName: a.fieldName, id: a.id, readonly: a.readonly, hasAppearance: a.hasAppearance, subtype: a.subtype}))
}

async function buttonClicked(e){
  console.log(DOCUMENT_ACROFORM_FIELD_MAP.get("topmostSubform[0].Page1[0].Step1a[0].f1_01[0]"))
  console.log(DOCUMENT_ACROFORM_FIELD_MAP.get("topmostSubform[0].Page1[0].Step1a[0].f1_01[0]").value())
}

