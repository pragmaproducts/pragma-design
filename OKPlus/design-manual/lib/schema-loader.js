export async function loadSchema(path) {
   return fetch('schemas/' + path).then(response => response.json());
}