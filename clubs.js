const clubDetails = {
    glee: {
        title: 'Glee Club',
        description: 'Join us in exploring the fascinating world of music and soul!',
        fullDescription: 'Offers different vocal techniques and exercises, for students who have a passion for singing.',
        activities: [
            'Weekly Vocal Exercises',
            'School event participation',
            'Glee competition preparation',
        ],
        requirements: 'Open to all students with interest in music. No prerequisites required.',
        contact: 'glee@obmontessori.edu.ph'
    },
    communication: {
        title: 'Communication Arts Club',
        description: 'Express your creativity through communication and arts!',
        fullDescription: 'The Communication Arts Club dhrough debates, public speaking, and journalism.',
        activities: [
            'Competition preparation',
            'Literature discussions',
            'Poetry writing',
        ],
        requirements: 'Open to all students. Basic English knowledge required.',
        contact: 'communicationarts@obmontessori.edu.ph'
    },
    math: {
        title: 'Math Club',
        description: 'Hone your argumentation skills and participate in inter-school debate competitions.',
        fullDescription: 'The Math Club invites students to enhance their Math solving skills.',
        activities: [
            'Math workshops',
            'Competition participation',
            'Collaborative activities',
        ],
        requirements: 'Open to all students. Basic Math knowledge required.',
        contact: 'math@obmontessori.edu.ph'
    },
    band: {
        title: 'Marching Band',
        description: 'Join our musical community and perform!',
        fullDescription: 'Like the Glee Club, the Marching Band brings together students who share a passion for music. We perform at school events, participate in music festivals, and organize concerts.',
        activities: [
            'Weekly rehearsals',
            'School event performances',
            'Music festival participation',
            'Concert organization',
            'Music theory lessons'
        ],
        requirements: 'Open to all students. Basic musical knowledge helpful but not required.',
        contact: 'band@obmontessori.edu.ph'
    },
    dance: {
        title: 'Dance Club',
        description: 'Emphasizes high energy, music, and offers social experience',
        fullDescription: 'The Photography Club teaches students the art of expression through dancing!',
        activities: [
            'Exercises',
            'School Event Participation',
            'Competition participation'
        ],
        requirements: 'Open to all students who have a passion for dancing.',
        contact: 'dance@obmontessori.edu.ph'
    },
    science: {
        title: 'Science Club',
        description: 'Train hard for the Science Olympiad Competition!',
        fullDescription: 'The Science Club represents OB Montessori Fairview in inter-school competitions. We focus on skill development and teamwork in answering Scientific questions.',
        activities: [
            'Regular training sessions',
            'Inter-school competitions',
            'Science skills development',
            'Team building activities',
        ],
        requirements: 'Open for all. Basic Science knowledge required.',
        contact: 'science@obmontessori.edu.ph'
    }
}

// Filter clubs by category
document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const clubCards = document.querySelectorAll('.club-card');
    const searchInput = document.getElementById('searchClubs');
    
    // Category filter
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter clubs
            clubCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden');
                    card.style.animation = 'fadeIn 0.5s ease';
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
    
    // Search filter
    searchInput.addEventListener('input', (e) => {
        filterAndSortClubs();
    });
    
    // Sort functionality
    const sortSelect = document.getElementById('sortClubs');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            filterAndSortClubs();
        });
    }
    
    // Filter and Sort function
    function filterAndSortClubs() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';
        const sortBy = sortSelect?.value || 'name';
        
        const visibleCards = Array.from(clubCards).filter(card => {
            const cardText = card.textContent.toLowerCase();
            const category = card.getAttribute('data-category');
            
            const matchesSearch = cardText.includes(searchTerm);
            const matchesCategory = activeFilter === 'all' || category === activeFilter;
            
            if (matchesSearch && matchesCategory) {
                card.classList.remove('hidden');
                return true;
            } else {
                card.classList.add('hidden');
                return false;
            }
        });
        
        // Sort visible cards
        visibleCards.sort((a, b) => {
            const cardA = a.querySelector('.card');
            const cardB = b.querySelector('.card');
            
            if (sortBy === 'name') {
                const nameA = cardA.querySelector('.card-title')?.textContent || '';
                const nameB = cardB.querySelector('.card-title')?.textContent || '';
                return nameA.localeCompare(nameB);
            } else if (sortBy === 'members') {
                const membersA = parseInt(cardA.querySelector('.club-details p')?.textContent.match(/\d+/) || '0');
                const membersB = parseInt(cardB.querySelector('.club-details p')?.textContent.match(/\d+/) || '0');
                return membersB - membersA; // Descending order
            } else if (sortBy === 'category') {
                const catA = a.getAttribute('data-category');
                const catB = b.getAttribute('data-category');
                return catA.localeCompare(catB);
            }
            return 0;
        });
        
        // Reorder in DOM
        const container = document.getElementById('clubsContainer');
        visibleCards.forEach(card => {
            container.appendChild(card);
        });
        
        // Add fade animation
        visibleCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.transition = 'all 0.3s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 10);
            }, index * 50);
        });
    }
    
    // Add hover effects to club cards
    clubCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Animate cards on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    clubCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});