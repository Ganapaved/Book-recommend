// Function to open or close the sliding comment panel
function toggleCommentPanel(bookTitle) {
    const panel = document.getElementById('comment-panel');
    
    // If the panel is already visible, close it
    if (panel.classList.contains('active')) {
        panel.classList.remove('active');
    } else {
        panel.classList.add('active');

        // Fetch the comments for the selected book title
        fetchComments(bookTitle);
    }
}

// Fetch comments for the given book title
function fetchComments(bookTitle) {
    fetch(`/comments_page?title=${bookTitle}`)
        .then(response => response.json())
        .then(data => {
            // Dynamically insert the comments into the panel content
            const panelContent = document.querySelector('.panel-content');
            let commentsHtml = `<h3>Comments for ${bookTitle}</h3>`;
            data.comments.forEach(comment => {
                commentsHtml += `<p>${comment.content}</p>`;
            });

            // Append a form to add a new comment
            commentsHtml += `
                <textarea id="new-comment" placeholder="Add a comment..."></textarea>
                <button onclick="submitComment('${bookTitle}')">Submit</button>
            `;

            panelContent.innerHTML = commentsHtml;
        })
        .catch(error => console.log('Error fetching comments:', error));
}

// Submit a new comment
function submitComment(bookTitle) {
    const commentContent = document.getElementById('new-comment').value;

    fetch('/add_comment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: bookTitle,
            content: commentContent,
        }),
    })
    .then(response => response.json())
    .then(data => {
        // Optionally, you can update the comments list dynamically here after submitting the comment
        fetchComments(bookTitle);
    })
    .catch(error => console.log('Error submitting comment:', error));
}
