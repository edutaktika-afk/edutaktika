// Custom quarter dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
    const dropdownBtn = document.getElementById('quarterDropdownBtn');
    const dropdownList = document.getElementById('quarterDropdownList');

    // Toggle dropdown list
    dropdownBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownList.classList.toggle('show');
    });

    // Select an option
    dropdownList.querySelectorAll('li').forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownBtn.textContent = this.textContent;
            dropdownList.classList.remove('show');
            dropdownList.querySelectorAll('li').forEach(li => li.classList.remove('active'));
            this.classList.add('active');
            // Show the correct section if you have quarter sections
            document.querySelectorAll('.quarter-section').forEach(sec => sec.classList.remove('active'));
            const target = this.getAttribute('data-target');
            const section = document.getElementById(target);
            if(section) section.classList.add('active');
        });
    });

    // Close dropdown if clicking outside
    document.addEventListener('click', function() {
        dropdownList.classList.remove('show');
    });
});