package com.safeconnect.backend.service;

import com.safeconnect.backend.dto.ContactRequest;
import com.safeconnect.backend.entity.Contact;
import com.safeconnect.backend.entity.User;
import com.safeconnect.backend.repository.ContactRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContactService {

    private final ContactRepository contactRepository;

    public ContactService(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    public Contact addContact(ContactRequest request, User user) {
        Contact contact = new Contact();
        contact.setName(request.getName());
        contact.setPhone(request.getPhone());
        contact.setUser(user);
        return contactRepository.save(contact);
    }

    public List<Contact> getContactsByUser(User user) {
        return contactRepository.findByUser(user);
    }
}
