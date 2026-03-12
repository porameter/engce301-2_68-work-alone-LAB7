const BorrowingDB = require('../database/borrowings.db');
const BookDB = require('../database/books.db');
const MemberDB = require('../database/members.db');

class BorrowingService {

    // ===== BORROW BOOK =====
    static async borrowBook(borrowData) {
        const { book_id, member_id } = borrowData;

        // 1. ตรวจสอบหนังสือ
        const book = await BookDB.findById(book_id);
        if (!book) throw new Error('Book not found');
        if (book.available_copies <= 0) throw new Error('No available copies');

        // 2. ตรวจสอบสมาชิก
        const member = await MemberDB.findById(member_id);
        if (!member) throw new Error('Member not found');
        if (member.status !== 'active') throw new Error('Member is not active');

        // 3. ตรวจสอบ limit 3 เล่ม
        const count = await BorrowingDB.countActiveBorrowings(member_id);
        if (count >= 3) throw new Error('Borrow limit exceeded (max 3 books)');

        // 4. คำนวณ due_date = 14 วัน
        const borrowDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(borrowDate.getDate() + 14);

        const borrow_date = borrowDate.toISOString().split('T')[0];
        const due_date = dueDate.toISOString().split('T')[0];

        // 5. สร้าง borrowing
        const result = await BorrowingDB.create({
            book_id,
            member_id,
            borrow_date,
            due_date
        });

        // 6. ลด available_copies
        await BookDB.decreaseAvailableCopies(book_id);

        return {
            id: result.id,
            book_id,
            book_title: book.title,
            member_id,
            member_name: member.name,
            borrow_date,
            due_date,
            status: 'borrowed'
        };
    }

    // ===== RETURN BOOK =====
    static async returnBook(borrowingId) {
        const borrowing = await BorrowingDB.findById(borrowingId);
        if (!borrowing) throw new Error('Borrowing record not found');
        if (borrowing.status === 'returned') throw new Error('Book already returned');

        const returnDate = new Date().toISOString().split('T')[0];

        // คำนวณค่าปรับ
        const due = new Date(borrowing.due_date);
        const returned = new Date(returnDate);

        let days_overdue = 0;
        let fine = 0;
        let status = 'returned';

        if (returned > due) {
            days_overdue = Math.ceil(
                (returned - due) / (1000 * 60 * 60 * 24)
            );
            fine = days_overdue * 20;
            status = 'overdue';
        }

        // update borrowing
        await BorrowingDB.returnBook(borrowingId, returnDate, status);

        // เพิ่ม available_copies
        await BookDB.increaseAvailableCopies(borrowing.book_id);

        return {
            id: borrowingId,
            return_date: returnDate,
            days_overdue,
            fine
        };
    }

    // ===== GET OVERDUE =====
    static async getOverdueBorrowings() {
        return await BorrowingDB.findOverdue();
    }
}

module.exports = BorrowingService;
