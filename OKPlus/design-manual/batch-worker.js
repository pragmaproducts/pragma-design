onmessage = function(event) {
    const id = event.data.id;
    const data = event.data.dataset;
    const size = event.data.size;
    const page = event.data.page;
    const numberOfPages = Math.ceil(data.length / size);

    if(page <= numberOfPages) {
        const batch = data.slice((page * size), (page + 1) * size);

        postMessage({
            id: id,
            size: size,
            items: batch,
            dataset: data,
            page: page
        });
    }
};