const commentsSection = document.getElementById('comments');
const commentsWrapper = commentsSection.querySelector('#comments-wrapper');
const commentsCount = commentsSection.querySelector('#comments-count');

// when a user gets close to the bottom of the screen, fetch comments
const commentsObserver = new IntersectionObserver((entries, self) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            fetchComments(); // this is the important part
            self.unobserve(entry.target);
        }
    })
}, {rootMargin: '200px 0px 0px 0px' });

commentsObserver.observe(commentsSection);

const fetchComments = async () => {
    try {
        const comments = await (await fetch(
            'https://api.github.com/repos/{{ issues_repo }}/issues/{{ issue_id }}/comments'
        )).json();
        initRenderComments(comments);
    } catch (e) {
        commentsWrapper.innerHTML = `<p>Unable to retrieve the comments for this post.</p>`;
    }
}

