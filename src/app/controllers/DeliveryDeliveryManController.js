import * as Yup from 'yup';

import { zonedTimeToUtc } from 'date-fns-tz';
import { set, isAfter, parseISO, isBefore } from 'date-fns';

import Delivery from '../models/Delivery';
import File from '../models/File';
import DeliveryMan from '../models/DeliveryMan';
import Recipient from '../models/Recipient';

const timeSP = 'America/Sao_Paulo';

class DeliveryDeliveryManController {
  async updateStart(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos campos' });
    }

    const { id } = req.params;
    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res
        .status(400)
        .json({ error: 'Id da encomenda enviado é inválido' });
    }

    if (delivery.start_date) {
      return res.status(400).json({ error: 'Encomenda já está retirada' });
    }

    if (delivery.canceled_at) {
      return res.status(400).json({ error: 'Encomenda está cancelada' });
    }

    const { start_date } = req.body;

    const { startTime } = set(new Date(), {
      hours: 8,
      minutes: 0,
      seconds: 0,
    });
    const { endTime } = set(new Date(), {
      hours: 18,
      minutes: 0,
      seconds: 0,
    });

    const startDate = zonedTimeToUtc(parseISO(start_date), timeSP);

    if (isBefore(startDate, startTime)) {
      return res
        .status(400)
        .json({ error: 'Data/Hora retirada menor do que a permitida' });
    }

    if (isAfter(startDate, endTime)) {
      return res
        .status(400)
        .json({ error: 'Data/Hora retirada maior do que a permitida' });
    }

    const deliveryRes = await delivery.update({ start_date: startDate });

    return res.json({
      deliveryRes,
    });
  }

  async updateEnd(req, res) {
    const schema = Yup.object().shape({
      end_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos campos' });
    }

    const { id } = req.params;
    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res
        .status(400)
        .json({ error: 'Id da encomenda enviado é inválido' });
    }

    if (!delivery.start_date) {
      return res.status(400).json({ error: 'Encomenda não foi retirada' });
    }

    if (delivery.end_date) {
      return res.status(400).json({ error: 'Encomenda já está encerrada' });
    }

    if (delivery.canceled_at) {
      return res.status(400).json({ error: 'Encomenda está cancelada' });
    }

    const { end_date, signature_id } = req.body;

    const endDate = zonedTimeToUtc(parseISO(end_date), timeSP);

    const deliveryRes = await Delivery.update({
      end_date: endDate,
      signature_id,
    });

    return res.json({
      deliveryRes,
    });
  }

  async index(req, res) {
    const schema = Yup.object().shape({
      delivered: Yup.boolean(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos campos' });
    }

    const { page = 1 } = req.query;
    const { id } = req.params;
    const { delivered } = req.body;

    const deliverys = await Delivery.findAll({
      where: {
        canceled_at: null,
        end_date: delivered ? !null : null,
        deliveryman_id: id,
      },
      Delivery: [['created_at', 'DESC']],
      attributes: [
        'id',
        'product',
        'start_date',
        'end_date',
        'canceled',
        'delivered',
      ],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'name', 'path'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'street',
            'number',
            'complement',
            'state',
            'city',
            'zipcode',
          ],
        },
        {
          model: DeliveryMan,
          as: 'deliveryman',
          attributes: ['name'],
        },
      ],
    });

    if (deliverys.length < 1) {
      return res
        .status(400)
        .json({ error: 'Não foi encontrado nenhuma encomenda' });
    }

    return res.json({
      deliverys,
    });
  }
}

export default new DeliveryDeliveryManController();
