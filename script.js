const fileInput = document.getElementById('fileInput');
const tocList = document.getElementById('tocList');
const textContent = document.getElementById('textContent');
const hamburgerButton = document.getElementById('hamburgerButton');

fileInput.addEventListener('change', handleFileInputChange);

function handleFileInputChange() {
    const file = fileInput.files[0];
    if (file) {
        readFile(file);
    }
}

function fetchJSONFromURL(url) {
    setLoading(true);
    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Network response was not ok.');
            }
        })
        .then(jsonObject => {
            buildTOC(jsonObject);
        })
        .catch(error => {
            alert("Error fetching JSON. Make sure the URL is correct and the server supports CORS.");
            console.error("Fetch error:", error);
        })
        .finally(() => {
            setLoading(false);
        });
}

function resetPage() {
    tocList.innerHTML = ""; // Clear previous TOC
    textContent.innerHTML = ""; // Clear previous content
}

function readFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const contents = e.target.result;
        try {
            const json = JSON.parse(contents);
            if(json && json.pages.length > 0) {
                hamburgerButton.style.display = 'block';
                buildTOC(json.pages);
            } else {
                hamburgerButton.style.display = 'none';
                resetPage();
            }
        } catch (error) {
            alert("Invalid JSON file.");
            console.error("Parsing error:", error);
        }
    };
    reader.readAsText(file);
}

function buildTOC(jsonArray) {
    resetPage();

    jsonArray.forEach((item, index) => {
        // Create a list item for each section
        let title = item.name;
        let li = document.createElement('li');
        let a = document.createElement('a');
        let aid = generateIdFromText(title);
        a.href = `#${aid}`;
        a.textContent = title;
        a.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent the default anchor link behavior
            document.getElementById(aid).scrollIntoView({
                behavior: 'smooth'
            });
        });
        li.appendChild(a);
        //li.onclick = function() { displayContent(item.content); };
        tocList.appendChild(li);

        const section = document.createElement('h1');
        section.id = aid;
        section.textContent = title;
        textContent.appendChild(section);
        
        // Add the section content to `textContent`
        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = item.text.content;
        textContent.appendChild(contentDiv);

        // Parse the HTML content and create TOC items
        const headers = contentDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');

        headers.forEach(header => {
            // Generate a unique ID for each header based on its text content
            const id = generateIdFromText(header.textContent);
            header.id = id; // Set the ID on the actual header element

            // Create TOC item pointing to the header ID
            const subli = document.createElement('li');
            const anchor = document.createElement('a');
            anchor.href = `#${id}`;
            anchor.textContent = header.textContent;
            anchor.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent the default anchor link behavior
                document.getElementById(header.id).scrollIntoView({
                    behavior: 'smooth'
                });
            });
            subli.appendChild(anchor);
            subli.style.paddingLeft = "20px";
            subli.className = 'subtoc-item';
            tocList.appendChild(subli);
        });
    });
}

// Helper function to generate a unique ID from text by removing non-alphanumeric
// characters and replacing spaces with hyphens.
function generateIdFromText(text) {
    const allowedCharacters = /[^a-z0-9\u4e00-\u9fa5]/g;
    const collapseHyphens = /-+/g;
    return text.toLowerCase().replace(allowedCharacters, '-').replace(collapseHyphens, '-');
}

function displayContent(content) {
    textContent.innerHTML = content;
}

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {
    scrollFunction();
};

function scrollFunction() {
    const button = document.getElementById("jumpToTop");
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        button.style.display = "block";
    } else {
        button.style.display = "none";
    }
}

// When the user clicks on the button, scroll to the top of the document
document.getElementById("jumpToTop").onclick = function() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
};

document.addEventListener('DOMContentLoaded', function () {
  var tocContainer = document.getElementById('toc');

  hamburgerButton.addEventListener('click', function () {
    // Toggle TOC visibility
    tocContainer.style.display = tocContainer.style.display === 'block' ? 'none' : 'block';
  });
});
